import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { AdminUser, type IAdminUser } from "@/models/AdminUser";
import { hashPassword } from "@/lib/password";
import type { AdminRole, AdminStatus } from "@/types/admin";
import type { AdminUserDto } from "@/types/admin-user";

export { hashPassword } from "@/lib/password";

export function sanitizeAdminUser(
  doc: Pick<IAdminUser, "name" | "email" | "role" | "status" | "lastLogin"> & {
    _id: unknown;
    createdAt?: Date;
    updatedAt?: Date;
  }
): AdminUserDto {
  return {
    id: String(doc._id),
    name: doc.name,
    email: doc.email,
    role: doc.role as AdminRole,
    status: doc.status as AdminStatus,
    lastLoginAt: doc.lastLogin ? new Date(doc.lastLogin).toISOString() : undefined,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : undefined,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : undefined,
  };
}

export interface AdminUsersFilters {
  search?: string;
  role?: AdminRole;
  status?: AdminStatus;
  page?: number;
  limit?: number;
}

export async function getAdminUsers(filters: AdminUsersFilters = {}): Promise<{
  users: AdminUserDto[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 20));

  await connectDB();

  const query: Record<string, unknown> = {};
  if (filters.role) query.role = filters.role;
  if (filters.status) query.status = filters.status;
  if (filters.search?.trim()) {
    const s = filters.search.trim();
    query.$or = [
      { name: { $regex: s, $options: "i" } },
      { email: { $regex: s, $options: "i" } },
    ];
  }

  const [docs, total] = await Promise.all([
    AdminUser.find(query)
      .select("name email role status lastLogin createdAt updatedAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    AdminUser.countDocuments(query),
  ]);

  return {
    users: docs.map((d) =>
      sanitizeAdminUser(d as IAdminUser & { _id: unknown })
    ),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getAdminUserById(id: string): Promise<AdminUserDto | null> {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectDB();
  const doc = await AdminUser.findById(id)
    .select("name email role status lastLogin createdAt updatedAt")
    .lean();
  if (!doc) return null;
  return sanitizeAdminUser(doc as IAdminUser & { _id: unknown });
}

export async function countActiveSuperAdmins(excludeId?: string): Promise<number> {
  await connectDB();
  const filter: Record<string, unknown> = { role: "superAdmin", status: "active" };
  if (excludeId) filter._id = { $ne: excludeId };
  return AdminUser.countDocuments(filter);
}

export async function createAdminUser(
  input: {
    name: string;
    email: string;
    password: string;
    role: AdminRole;
    status: AdminStatus;
  },
  createdById: string
): Promise<AdminUserDto> {
  await connectDB();
  const email = input.email.toLowerCase().trim();
  const exists = await AdminUser.exists({ email });
  if (exists) throw new Error("An admin with this email already exists.");

  const passwordHash = await hashPassword(input.password);
  const doc = await AdminUser.create({
    name: input.name.trim(),
    email,
    passwordHash,
    role: input.role,
    status: input.status,
    createdBy: new mongoose.Types.ObjectId(createdById),
    updatedBy: new mongoose.Types.ObjectId(createdById),
  });

  return sanitizeAdminUser(doc.toObject());
}

export async function updateAdminUser(
  id: string,
  input: {
    name?: string;
    email?: string;
    password?: string;
    role?: AdminRole;
    status?: AdminStatus;
  },
  updatedById: string
): Promise<AdminUserDto> {
  await connectDB();
  const user = await AdminUser.findById(id);
  if (!user) throw new Error("Admin user not found.");

  if (input.email) {
    const email = input.email.toLowerCase().trim();
    const dup = await AdminUser.exists({ email, _id: { $ne: id } });
    if (dup) throw new Error("An admin with this email already exists.");
    user.email = email;
  }
  if (input.name) user.name = input.name.trim();
  if (input.role) user.role = input.role;
  if (input.status) user.status = input.status;
  if (input.password?.trim()) {
    user.passwordHash = await hashPassword(input.password);
  }
  user.updatedBy = new mongoose.Types.ObjectId(updatedById);
  await user.save();

  return sanitizeAdminUser(user.toObject());
}

export async function deactivateAdminUser(id: string, updatedById: string): Promise<void> {
  await updateAdminUser(id, { status: "inactive" }, updatedById);
}
