import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminToken } from "@/lib/jwt";
import { ADMIN_COOKIE_NAME } from "@/lib/constants";
import { normalizeRedirectPath, shouldSkipRedirect } from "@/lib/redirect-path";

const ADMIN_LOGIN_PREFIX = "/admin/login";

export function isAdminPageProtected(pathname: string): boolean {
  return pathname.startsWith("/admin") && !pathname.startsWith(ADMIN_LOGIN_PREFIX);
}

export function isAdminApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/admin");
}

async function resolvePublicRedirect(
  request: NextRequest,
  pathname: string
): Promise<NextResponse | null> {
  const normalized = normalizeRedirectPath(pathname);
  const lookupUrl = new URL("/api/redirects/lookup", request.url);
  lookupUrl.searchParams.set("path", normalized);

  try {
    const res = await fetch(lookupUrl.toString(), {
      method: "GET",
      headers: { "x-redirect-lookup": "1" },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = (await res.json()) as {
      found?: boolean;
      toPath?: string;
      statusCode?: number;
    };

    if (!data.found || !data.toPath) return null;

    const status = [301, 302, 307, 308].includes(data.statusCode ?? 301)
      ? (data.statusCode as 301 | 302 | 307 | 308)
      : 301;

    const target = data.toPath.startsWith("http")
      ? data.toPath
      : new URL(data.toPath, request.url).toString();

    return NextResponse.redirect(target, status);
  } catch {
    return null;
  }
}

/**
 * Next.js 16 convention: middleware logic lives here (Edge-compatible, no Mongoose).
 * `/admin/login`, `/api/auth/login`, `/api/auth/logout` stay outside matchers.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const adminPageProtected = isAdminPageProtected(pathname);
  const adminApi = isAdminApiRoute(pathname);

  if (adminPageProtected || adminApi) {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) {
      return handleUnauthenticated(request, pathname, adminApi);
    }

    let payload = null as Awaited<ReturnType<typeof verifyAdminToken>>;
    try {
      payload = await verifyAdminToken(token);
    } catch {
      payload = null;
    }
    if (!payload) {
      return handleUnauthenticated(request, pathname, adminApi);
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-admin-id", payload.userId);
    requestHeaders.set("x-admin-email", payload.email);
    requestHeaders.set("x-admin-role", payload.role);

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (!shouldSkipRedirect(pathname)) {
    const redirectResponse = await resolvePublicRedirect(request, pathname);
    if (redirectResponse) return redirectResponse;
  }

  return NextResponse.next();
}

function handleUnauthenticated(
  request: NextRequest,
  pathname: string,
  isAdminApi: boolean
): NextResponse {
  if (isAdminApi) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Please log in." },
      { status: 401 }
    );
  }

  const loginUrl = new URL(ADMIN_LOGIN_PREFIX, request.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
