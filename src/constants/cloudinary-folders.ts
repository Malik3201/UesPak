/**
 * Cloudinary folder paths — safe to import in both client and server code
 * because this file has no Node.js dependencies.
 */
export const CLOUDINARY_FOLDERS = {
  general: "uespak/general",
  settings: "uespak/settings",
  profilePdf: "uespak/profile-pdf",
  services: "uespak/services",
  projects: "uespak/projects",
  team: "uespak/team",
  seo: "uespak/seo",
  clients: "uespak/clients",
} as const;

export type CloudinaryFolder =
  (typeof CLOUDINARY_FOLDERS)[keyof typeof CLOUDINARY_FOLDERS];
