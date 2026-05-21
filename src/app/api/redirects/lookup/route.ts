import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  getActiveRedirectByPath,
  incrementRedirectHit,
  normalizeRedirectPath,
} from "@/lib/redirects";

/**
 * Public redirect lookup for Edge proxy (no Mongoose in proxy).
 * GET /api/redirects/lookup?path=/old-url
 */
export async function GET(request: NextRequest) {
  const pathParam = request.nextUrl.searchParams.get("path");
  if (!pathParam) {
    return NextResponse.json({ found: false }, { status: 404 });
  }

  const normalized = normalizeRedirectPath(pathParam);
  const match = await getActiveRedirectByPath(normalized);

  if (!match) {
    return NextResponse.json({ found: false }, { status: 404 });
  }

  void incrementRedirectHit(match.id);

  return NextResponse.json({
    found: true,
    toPath: match.toPath,
    statusCode: match.statusCode,
  });
}
