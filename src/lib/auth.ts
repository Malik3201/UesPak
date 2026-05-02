import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { verifyAdminToken } from "@/lib/jwt";
import { ADMIN_COOKIE_NAME } from "@/lib/constants";
import type { Types } from "mongoose";
import { AdminUser } from "@/models/AdminUser";
import type { AdminRole, AdminStatus, SafeAdmin } from "@/types/admin";

export class AdminAuthError extends Error {
  readonly status = 401;
  constructor(message = "Unauthorized. Please log in.") {
    super(message);
    this.name = "AdminAuthError";
  }
}

export class AdminForbiddenError extends Error {
  readonly status = 403;
  constructor(message = "Forbidden. You do not have permission.") {
    super(message);
    this.name = "AdminForbiddenError";
  }
}

function toSafeAdmin(doc: {
  _id: Types.ObjectId;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
}): SafeAdmin {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    role: doc.role,
    status: doc.status,
  };
}

/**
 * Resolved admin session from JWT cookie + database (must be active).
 * Returns null when unauthenticated or when the DB user is inactive.
 */
export async function getCurrentAdmin(): Promise<SafeAdmin | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifyAdminToken(token);
    if (!payload) return null;

    await connectDB();
    const user = await AdminUser.findById(payload.userId)
      .select("name email role status")
      .lean();

    if (!user || user.status !== "active") return null;

    return toSafeAdmin({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role as AdminRole,
      status: user.status as AdminStatus,
    });
  } catch {
    return null;
  }
}

/** Require a logged-in active admin or throw AdminAuthError. */
export async function requireAdmin(): Promise<SafeAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) throw new AdminAuthError();
  return admin;
}

/**
 * Role check. `superAdmin` is treated as having access to every role-gated route.
 */
export function hasRole(
  user: Pick<SafeAdmin, "role"> | null | undefined,
  allowedRoles: readonly AdminRole[]
): boolean {
  if (!user) return false;
  if (user.role === "superAdmin") return true;
  return allowedRoles.includes(user.role);
}

/** Like requireAdmin plus allowed roles (superAdmin always passes). */
export async function requireRole(
  allowedRoles: readonly AdminRole[]
): Promise<SafeAdmin> {
  const admin = await requireAdmin();
  if (!hasRole(admin, allowedRoles))
    throw new AdminForbiddenError();
  return admin;
}
