// ─── Site constants ────────────────────────────────────────────────────────────
export const SITE_NAME = "UESPAK";
export const CONTACT_EMAIL = "services@uespak.com";

/** Single httpOnly admin session cookie across login, logout, middleware, helpers. */
export const ADMIN_COOKIE_NAME = "uespak_admin_token";

// ─── Pagination ────────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// ─── Status enums ──────────────────────────────────────────────────────────────
export const STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const;

export type StatusValue = (typeof STATUS)[keyof typeof STATUS];

// ─── Admin roles (JWT + AdminUser.role) ────────────────────────────────────────
export const ROLES = {
  SUPER_ADMIN: "superAdmin",
  ADMIN: "admin",
  EDITOR: "editor",
} as const;

export type RoleValue = (typeof ROLES)[keyof typeof ROLES];

// ─── Cloudinary folders (mirrored from lib/cloudinary.ts for UI use) ──────────
export const CLOUDINARY_FOLDER_KEYS = [
  "services",
  "projects",
  "team",
  "profilePdf",
  "general",
] as const;
