import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminToken } from "@/lib/jwt";
import { ADMIN_COOKIE_NAME } from "@/lib/constants";

const ADMIN_LOGIN_PREFIX = "/admin/login";

export function isAdminPageProtected(pathname: string): boolean {
  return pathname.startsWith("/admin") && !pathname.startsWith(ADMIN_LOGIN_PREFIX);
}

export function isAdminApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/admin");
}

/**
 * Next.js 16 convention: middleware logic lives here (Edge-compatible, no Mongoose).
 * `/admin/login`, `/api/auth/login`, `/api/auth/logout` stay outside matchers.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const adminPageProtected = isAdminPageProtected(pathname);
  const adminApi = isAdminApiRoute(pathname);

  if (!adminPageProtected && !adminApi) {
    return NextResponse.next();
  }

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
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
