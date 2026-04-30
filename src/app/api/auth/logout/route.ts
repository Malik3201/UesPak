import { ADMIN_COOKIE_NAME } from "@/lib/constants";
import { successResponse } from "@/lib/api-response";

export async function POST() {
  const response = successResponse("Logged out successfully.");

  const headers = new Headers(response.headers);
  // Expire the cookie immediately
  headers.set(
    "Set-Cookie",
    `${ADMIN_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`
  );

  return new Response(response.body, {
    status: response.status,
    headers,
  });
}
