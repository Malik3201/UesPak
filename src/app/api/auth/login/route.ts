import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { AdminUser } from "@/models/AdminUser";
import { comparePassword } from "@/lib/password";
import { signAdminToken, jwtExpiresInSeconds } from "@/lib/jwt";
import { loginValidator } from "@/validators/auth.validator";
import {
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  tooManyRequestsResponse,
} from "@/lib/api-response";
import { ADMIN_COOKIE_NAME } from "@/lib/constants";
import { allowLoginAttempt } from "@/lib/login-rate-limit";
import type { ApiResponse } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return errorResponse("Invalid request body.", 400);
    }

    const parsed = loginValidator.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.flatten().fieldErrors);
    }

    const { email, password } = parsed.data;

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip")?.trim() ||
      "unknown";
    const rateKey = `${ip}:${email.toLowerCase()}`;
    if (!allowLoginAttempt(rateKey)) {
      return tooManyRequestsResponse();
    }

    await connectDB();

    const user = await AdminUser.findOne({ email }).select("+passwordHash");
    // Generic messaging for unknown account, inactive, or suspended — avoid account enumeration.
    if (!user || user.status !== "active") {
      return unauthorizedResponse("Invalid email or password.");
    }

    const passwordOk = await comparePassword(password, user.passwordHash);
    if (!passwordOk) {
      return unauthorizedResponse("Invalid email or password.");
    }

    await AdminUser.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    const safeUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = await signAdminToken({
      userId: safeUser.id,
      email: safeUser.email,
      name: safeUser.name,
      role: user.role,
    });

    const maxAge = jwtExpiresInSeconds();

    const jsonBody: ApiResponse<{ user: typeof safeUser }> = {
      success: true,
      message: "Login successful.",
      data: { user: safeUser },
    };

    const res = NextResponse.json(jsonBody, { status: 200 });

    const useSecureCookie =
      process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

    res.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: useSecureCookie,
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    return res;
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return errorResponse("An unexpected error occurred. Please try again.");
  }
}
