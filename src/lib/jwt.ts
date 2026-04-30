import jwt from "jsonwebtoken";

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

/**
 * Sign a JWT token.
 */
export function signJwt(payload: JwtPayload): string {
  const secret = process.env.JWT_SECRET;
  const expiresIn = (process.env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]) ?? "7d";

  if (!secret) {
    throw new Error("[UESPAK] JWT_SECRET is not defined.");
  }

  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Verify and decode a JWT token. Returns null if invalid or expired.
 */
export function verifyJwt(token: string): JwtPayload | null {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("[UESPAK] JWT_SECRET is not defined.");
  }

  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch {
    return null;
  }
}
