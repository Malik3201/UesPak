import { SignJWT, jwtVerify } from "jose";
import type { AdminRole } from "@/types/admin";

/** Claims embedded in admin JWT (Edge-safe via jose). */
export interface AdminJwtClaims {
  userId: string;
  email: string;
  name: string;
  role: AdminRole;
}

/** Parse JWT_EXPIRES_IN (e.g. 7d, 12h, 30m, 900s) for cookie max-age. */
export function jwtExpiresInSeconds(): number {
  const raw = (process.env.JWT_EXPIRES_IN ?? "7d").trim();
  const m = /^(\d+)([smhd])$/i.exec(raw);
  if (!m) return 7 * 86400;
  const n = parseInt(m[1], 10);
  const u = m[2].toLowerCase();
  switch (u) {
    case "s":
      return n;
    case "m":
      return n * 60;
    case "h":
      return n * 3600;
    case "d":
      return n * 86400;
    default:
      return 7 * 86400;
  }
}

/** Mint an admin JWT (jose; usable from Node route handlers). */
export async function signAdminToken(claims: AdminJwtClaims): Promise<string> {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("[UESPAK] JWT_SECRET is not defined.");

  const expiresIn = process.env.JWT_EXPIRES_IN ?? "7d";

  return new SignJWT({
    userId: claims.userId,
    email: claims.email,
    name: claims.name,
    role: claims.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(new TextEncoder().encode(secret));
}

/**
 * Verify an admin JWT. Returns null when invalid or expired (no secrets logged).
 */
export async function verifyAdminToken(
  token: string
): Promise<AdminJwtClaims | null> {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("[UESPAK] JWT_SECRET is not defined.");

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    const userId =
      typeof payload.userId === "string"
        ? payload.userId
        : typeof payload.sub === "string"
          ? payload.sub
          : null;
    const email = typeof payload.email === "string" ? payload.email : null;
    const name = typeof payload.name === "string" ? payload.name : "";
    const roleRaw = typeof payload.role === "string" ? payload.role : null;

    if (!userId || !email || !roleRaw) return null;

    const role = roleRaw as AdminRole;
    if (!["superAdmin", "admin", "editor"].includes(role)) return null;

    return { userId, email, name, role };
  } catch {
    return null;
  }
}
