import { z } from "zod";
import { SITE_SETTINGS_DOCUMENT_KEY } from "@/constants/site-settings";

const HTTPS_PREFIX = /^https?:\/\//i;

function trimToUndef(max: number) {
  return z
    .union([z.string(), z.undefined(), z.null()])
    .transform((v) =>
      v === undefined || v === null ? "" : String(v).trim()
    )
    .pipe(
      z
        .string()
        .max(max)
        .transform((v) => (v === "" ? undefined : v))
    );
}

const optionalHttpUrl = z
  .union([z.string(), z.literal(""), z.undefined()])
  .transform((v) => {
    if (v === undefined) return "";
    return String(v).trim();
  })
  .pipe(
    z
      .string()
      .max(2048)
      .superRefine((val, ctx) => {
        if (!val) return;
        if (!HTTPS_PREFIX.test(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Must be a URL starting with http:// or https://",
          });
        }
      })
      .transform((val) => (val === "" ? undefined : val))
  );

const mediaInputSchema = z
  .union([
    z.object({
      url: z.string().optional(),
      altText: z.string().optional(),
      publicId: z.string().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      format: z.string().optional(),
      size: z.number().optional(),
    }),
    z.literal(null),
    z.undefined(),
  ])
  .optional()
  .transform((input) => {
    if (!input || input === null || typeof input !== "object") return undefined;
    const raw = typeof input.url === "string" ? input.url.trim() : "";
    if (!raw) return undefined;
    if (!HTTPS_PREFIX.test(raw)) return undefined;
    const pub =
      typeof input.publicId === "string" && input.publicId.trim().length > 0
        ? input.publicId.trim()
        : "external";
    const altRaw = typeof input.altText === "string" ? input.altText.trim() : "";
    const out: {
      url: string;
      publicId: string;
      altText?: string;
      width?: number;
      height?: number;
      format?: string;
      size?: number;
    } = {
      url: raw,
      publicId: pub,
      ...(altRaw ? { altText: altRaw } : {}),
      ...(input.width !== undefined && { width: input.width }),
      ...(input.height !== undefined && { height: input.height }),
      ...(typeof input.format === "string" &&
        input.format.trim() !== "" && { format: input.format.trim() }),
      ...(input.size !== undefined && { size: input.size }),
    };
    return out;
  });

const phoneEntrySchema = z.object({
  label: trimToUndef(50),
  value: z.string().trim().min(1, "Phone cannot be empty").max(80),
  isPrimary: z.boolean().optional(),
});

const emailEntrySchema = z.object({
  label: trimToUndef(50),
  value: z
    .string()
    .trim()
    .min(1)
    .max(254)
    .email("Must be a valid email"),
  isPrimary: z.boolean().optional(),
});

const socialEntrySchema = z.object({
  platform: z.string().trim().min(1, "Platform is required").max(80),
  url: z
    .string()
    .trim()
    .min(1)
    .url("Must be a valid URL"),
  icon: trimToUndef(80),
  isActive: z.boolean(),
  order: z.coerce.number().int().min(0).max(999),
});

const mapEmbedUrlSchema = z
  .union([z.string(), z.literal(""), z.undefined()])
  .transform((v) => {
    if (v === undefined) return "";
    return String(v).trim();
  })
  .pipe(
    z
      .string()
      .max(12000)
      .superRefine((val, ctx) => {
        if (!val) return;
        if (!HTTPS_PREFIX.test(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Map embed URL should start with http:// or https:// (iframe src URL)",
          });
        }
      })
      .transform((val) => (val === "" ? undefined : val))
  );

const globalCTASchema = z.object({
  title: trimToUndef(120),
  description: trimToUndef(280),
  buttonText: trimToUndef(80),
  buttonUrl: optionalHttpUrl,
  isActive: z.boolean().optional().default(false),
});

const robotsSchema = z
  .object({
    index: z.boolean(),
    follow: z.boolean(),
  })
  .default({ index: true, follow: true });

const seoSchema = z.object({
  metaTitle: trimToUndef(70),
  metaDescription: trimToUndef(180),
  keywords: z.array(z.string().trim().min(1).max(120)).optional().default([]),
  canonicalUrl: optionalHttpUrl,
  ogTitle: trimToUndef(110),
  ogDescription: trimToUndef(200),
  ogImage: mediaInputSchema,
  robots: robotsSchema,
  schemaType: trimToUndef(80),
});

/** Full CMS payload — used for PATCH (replace document fields). */
export const siteSettingsSchema = z.object({
  key: z.literal(SITE_SETTINGS_DOCUMENT_KEY).optional(),
  siteName: z
    .string()
    .trim()
    .min(2, "Site name must be at least 2 characters")
    .max(160),
  tagline: trimToUndef(220),
  logo: mediaInputSchema,
  darkLogo: mediaInputSchema,
  favicon: mediaInputSchema,

  phones: z.array(phoneEntrySchema).max(20).optional().default([]),
  emails: z.array(emailEntrySchema).max(20).optional().default([]),

  address: trimToUndef(2000),
  workingHours: trimToUndef(500),
  mapEmbedUrl: mapEmbedUrlSchema,

  socialLinks: z.array(socialEntrySchema).max(30).optional().default([]),

  profilePdf: mediaInputSchema,
  profileButtonText: trimToUndef(120),

  footerText: trimToUndef(240),
  copyrightText: trimToUndef(400),
  footerDescription: trimToUndef(2000),

  globalCTA: globalCTASchema,
  seo: seoSchema,
});

/** Alias — PATCH upserts entire settings document using the same validation shape. */
export const siteSettingsUpdateSchema = siteSettingsSchema;

export type SiteSettingsInput = z.output<typeof siteSettingsSchema>;
