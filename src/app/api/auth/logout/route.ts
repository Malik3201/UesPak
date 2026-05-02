import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/constants";
import type { ApiResponse } from "@/lib/api-response";

export async function POST() {
  const jsonBody: ApiResponse = {
    success: true,
    message: "Logged out successfully.",
  };

  const res = NextResponse.json(jsonBody, { status: 200 });
  const useSecureCookie =
    process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

  res.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: useSecureCookie,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
