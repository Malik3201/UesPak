import { z } from "zod";

// ─── Allowed MIME types ────────────────────────────────────────────────────────
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/svg+xml",
] as const;

export const ALLOWED_PDF_MIME_TYPES = ["application/pdf"] as const;

export const ALLOWED_VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

export const ALLOWED_MIME_TYPES = [
  ...ALLOWED_IMAGE_MIME_TYPES,
  ...ALLOWED_PDF_MIME_TYPES,
  ...ALLOWED_VIDEO_MIME_TYPES,
] as const;

// ─── Size limits ───────────────────────────────────────────────────────────────
export const IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const PDF_MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
export const VIDEO_MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

// ─── Validators ───────────────────────────────────────────────────────────────
export const mediaUploadValidator = z.object({
  altText: z.string().max(200).optional(),
  caption: z.string().max(500).optional(),
  folder: z
    .string()
    .min(1, "Folder is required.")
    .regex(/^[a-z0-9/_-]+$/, "Folder must be a valid path (lowercase, slashes, hyphens only)."),
  usage: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export type MediaUploadInput = z.infer<typeof mediaUploadValidator>;

export function validateMimeType(mimeType: string): boolean {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function validateFileSize(
  sizeBytes: number,
  mimeType: string
): { valid: boolean; maxMB: number } {
  if ((ALLOWED_VIDEO_MIME_TYPES as readonly string[]).includes(mimeType)) {
    return { valid: sizeBytes <= VIDEO_MAX_SIZE_BYTES, maxMB: 50 };
  }
  const isPdf = mimeType === "application/pdf";
  const maxBytes = isPdf ? PDF_MAX_SIZE_BYTES : IMAGE_MAX_SIZE_BYTES;
  const maxMB = isPdf ? 20 : 5;
  return { valid: sizeBytes <= maxBytes, maxMB };
}

export function resolveMediaType(
  mimeType: string
): "image" | "pdf" | "document" | "video" | "other" {
  if ((ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mimeType))
    return "image";
  if (mimeType === "application/pdf") return "pdf";
  if ((ALLOWED_VIDEO_MIME_TYPES as readonly string[]).includes(mimeType))
    return "video";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("application/")) return "document";
  return "other";
}
