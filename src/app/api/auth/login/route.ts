import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { AdminUser } from "@/models/AdminUser";
import { verifyPassword } from "@/lib/password";
import { signJwt } from "@/lib/jwt";
import { loginValidator } from "@/validators/auth.validator";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import { ADMIN_COOKIE_NAME } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    // Parse & validate body
    const body = await req.json().catch(() => null);
    if (!body) return errorResponse("Invalid request body.", 400);

    const parsed = loginValidator.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.flatten().fieldErrors);
    }

    const { email, password } = parsed.data;

    // Connect DB
    await connectDB();

    // Find admin user (select password explicitly since it's hidden by default)
    const user = await AdminUser.findOne({ email, isActive: true }).select(
      "+password"
    );

    if (!user) return unauthorizedResponse("Invalid email or password.");

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) return unauthorizedResponse("Invalid email or password.");

    // Sign JWT
    const token = signJwt({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Update last login
    await AdminUser.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

    // Set httpOnly cookie
    const expiresIn = process.env.JWT_EXPIRES_IN ?? "7d";
    const maxAge = expiresIn.endsWith("d")
      ? parseInt(expiresIn) * 86400
      : 86400 * 7;

    const response = successResponse("Login successful.", {
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });

    // Clone response to set cookie header
    const headers = new Headers(response.headers);
    headers.set(
      "Set-Cookie",
      `${ADMIN_COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`
    );

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return errorResponse("An unexpected error occurred. Please try again.");
  }
}
