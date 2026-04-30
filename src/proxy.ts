import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJoseJwt, COOKIE_NAME } from "@/lib/auth";

// ─── Routes to protect ────────────────────────────────────────────────────────
const ADMIN_LOGIN_PATH = "/admin/login";

function isAdminRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/admin") && !pathname.startsWith(ADMIN_LOGIN_PATH)
  );
}

function isAdminApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/admin");
}

// ─── Proxy (Next.js 16+ convention, replaces middleware) ──────────────────────
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdmin = isAdminRoute(pathname);
  const isAdminApi = isAdminApiRoute(pathname);

  if (!isAdmin && !isAdminApi) {
    return NextResponse.next();
  }

  // Read token from httpOnly cookie
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return handleUnauthenticated(request, pathname);
  }

  // Verify JWT (Edge-compatible via jose)
  const payload = await verifyJoseJwt(token);

  if (!payload) {
    return handleUnauthenticated(request, pathname);
  }

  // Attach user info to headers for downstream route handlers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-admin-id", payload.id);
  requestHeaders.set("x-admin-email", payload.email);
  requestHeaders.set("x-admin-role", payload.role);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

function handleUnauthenticated(
  request: NextRequest,
  pathname: string
): NextResponse {
  // API routes → return JSON 401
  if (isAdminApiRoute(pathname)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Please log in." },
      { status: 401 }
    );
  }

  // Browser routes → redirect to login
  const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

// ─── Matcher ──────────────────────────────────────────────────────────────────
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
