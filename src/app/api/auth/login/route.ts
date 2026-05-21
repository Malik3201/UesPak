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

    const user = (await AdminUser.findOne({ email })
      .select("+passwordHash +password +isActive")
      .lean()) as
      | (Record<string, unknown> & {
          _id: { toString(): string };
          name?: string;
          email?: string;
          role?: string;
          status?: string;
          passwordHash?: string;
          password?: string;
          isActive?: boolean;
        })
      | null;

    // Generic messaging for unknown account, inactive, or suspended — avoid account enumeration.
    if (!user) {
      return unauthorizedResponse("Invalid email or password.");
    }

    const status =
      typeof user.status === "string"
        ? user.status
        : user.isActive === false
          ? "inactive"
          : "active";
    if (status !== "active") {
      return unauthorizedResponse("Invalid email or password.");
    }

    const storedHash =
      typeof user.passwordHash === "string"
        ? user.passwordHash
        : typeof user.password === "string"
          ? user.password
          : null;
    if (!storedHash) {
      return unauthorizedResponse("Invalid email or password.");
    }

    const passwordOk = await comparePassword(password, storedHash);
    if (!passwordOk) {
      return unauthorizedResponse("Invalid email or password.");
    }

    const updatePayload: Record<string, unknown> = { lastLogin: new Date() };
    if (!user.passwordHash && user.password) {
      // Seamless migration for older records that still used `password`.
      updatePayload.passwordHash = user.password;
      updatePayload.password = undefined;
    }
    await AdminUser.findByIdAndUpdate(user._id, updatePayload);

    const safeUser = {
      id: user._id.toString(),
      name: typeof user.name === "string" ? user.name : "Admin User",
      email: typeof user.email === "string" ? user.email : email,
      role: typeof user.role === "string" ? user.role : "admin",
    };

    const token = await signAdminToken({
      userId: safeUser.id,
      email: safeUser.email,
      name: safeUser.name,
      role:
        safeUser.role === "superAdmin" ||
        safeUser.role === "admin" ||
        safeUser.role === "editor" ||
        safeUser.role === "viewer"
          ? safeUser.role
          : "admin",
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
