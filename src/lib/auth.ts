import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export interface AdminTokenPayload extends JWTPayload {
  id: string;
  email: string;
  role: string;
}

const COOKIE_NAME = "uespak_admin_token";

/**
 * Sign a JWT using jose (Edge-compatible).
 * Used by middleware and Edge API routes.
 */
export async function signJoseJwt(payload: AdminTokenPayload): Promise<string> {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("[UESPAK] JWT_SECRET is not defined.");

  const expiresIn = process.env.JWT_EXPIRES_IN ?? "7d";

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(new TextEncoder().encode(secret));
}

/**
 * Verify a JWT using jose (Edge-compatible).
 * Returns the decoded payload or null if invalid.
 */
export async function verifyJoseJwt(
  token: string
): Promise<AdminTokenPayload | null> {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("[UESPAK] JWT_SECRET is not defined.");

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );
    return payload as AdminTokenPayload;
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
