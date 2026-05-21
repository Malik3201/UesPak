/** Normalize request path for redirect lookup (no query/hash). Edge-safe. */
export function normalizeRedirectPath(path: string): string {
  const base = path.split("?")[0].split("#")[0] || "/";
  if (!base.startsWith("/")) return `/${base}`;
  if (base.length > 1 && base.endsWith("/")) {
    return base.replace(/\/+$/, "") || "/";
  }
  return base;
}

export function shouldSkipRedirect(pathname: string): boolean {
  if (pathname.startsWith("/admin")) return true;
  if (pathname.startsWith("/api")) return true;
  if (pathname.startsWith("/_next")) return true;
  if (pathname === "/favicon.ico") return true;
  if (pathname === "/robots.txt" || pathname === "/sitemap.xml") return true;
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) return true;
  return false;
}
