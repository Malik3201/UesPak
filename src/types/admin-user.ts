import type { AdminRole, AdminStatus } from "@/types/admin";

export interface AdminUserDto {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  superAdmin: "Super Admin",
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

export const ADMIN_STATUS_LABELS: Record<AdminStatus, string> = {
  active: "Active",
  inactive: "Disabled",
  suspended: "Suspended",
};
