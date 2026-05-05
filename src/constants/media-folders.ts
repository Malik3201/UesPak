/**
 * Media folder paths for provider uploads (ImageKit).
 * Kept in a shared constants file for both client and server imports.
 */
export const MEDIA_UPLOAD_FOLDERS = {
  general: "/uespak/general",
  settings: "/uespak/settings",
  profilePdf: "/uespak/profile-pdf",
  services: "/uespak/services",
  projects: "/uespak/projects",
  team: "/uespak/team",
  seo: "/uespak/seo",
  clients: "/uespak/clients",
} as const;

export type MediaUploadFolder =
  (typeof MEDIA_UPLOAD_FOLDERS)[keyof typeof MEDIA_UPLOAD_FOLDERS];
