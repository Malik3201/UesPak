import { z } from "zod";
import { SITE_SETTINGS_DOCUMENT_KEY } from "@/constants/site-settings";

const HTTPS_PREFIX = /^https?:\/\//i;

/** Zod 4: avoid `union(...undefined).pipe(string)` — pipe can see `undefined` and fail. */
function trimToUndef(max: number) {
  return z.preprocess(
    (v) => (v === undefined || v === null ? "" : String(v).trim()),
    z
      .string()
      .max(max)
      .transform((s) => (s === "" ? undefined : s))
  );
}

/**
 * Public / CTA URLs: https, site-relative `/...`, mailto:, or tel:.
 * Empty string → undefined.
 */
const flexOptionalPublicUrl = z.preprocess(
  (v) => (v === undefined || v === null ? "" : String(v).trim()),
  z
    .string()
    .max(2048)
    .superRefine((val, ctx) => {
      if (!val) return;
      const ok =
        HTTPS_PREFIX.test(val) ||
        val.startsWith("/") ||
        val.startsWith("mailto:") ||
        val.startsWith("tel:");
      if (!ok) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Must use http(s)://, a path starting with /, mailto:, or tel:",
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
      fileId: z.string().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      format: z.string().optional(),
      size: z.number().optional(),
      mimeType: z.string().optional(),
    }),
    z.literal(null),
    z.undefined(),
  ])
  .optional()
  .transform((input) => {
    if (!input || input === null || typeof input !== "object") return undefined;
    const raw = typeof input.url === "string" ? input.url.trim() : "";
    if (!raw) return undefined;
    const isHttps = HTTPS_PREFIX.test(raw);
    const isRootRelative = raw.startsWith("/");
    if (!isHttps && !isRootRelative) return undefined;
    const pub =
      typeof input.publicId === "string" && input.publicId.trim().length > 0
        ? input.publicId.trim()
        : isRootRelative
          ? raw.replace(/^\/+/, "").replace(/\//g, "-") || "path"
          : "external";
    const altRaw = typeof input.altText === "string" ? input.altText.trim() : "";
    const out: {
      url: string;
      publicId: string;
      fileId?: string;
      altText?: string;
      width?: number;
      height?: number;
      format?: string;
      size?: number;
      mimeType?: string;
    } = {
      url: raw,
      publicId: pub,
      ...(typeof input.fileId === "string" &&
        input.fileId.trim() !== "" && { fileId: input.fileId.trim() }),
      ...(altRaw ? { altText: altRaw } : {}),
      ...(input.width !== undefined && { width: input.width }),
      ...(input.height !== undefined && { height: input.height }),
      ...(typeof input.format === "string" &&
        input.format.trim() !== "" && { format: input.format.trim() }),
      ...(input.size !== undefined && { size: input.size }),
      ...(typeof input.mimeType === "string" &&
        input.mimeType.trim() !== "" && { mimeType: input.mimeType.trim() }),
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

/** Social / external link — must be usable in href; allows https or site-relative. */
const flexRequiredLinkUrl = z
  .string()
  .trim()
  .min(1, "URL is required")
  .max(2048)
  .superRefine((val, ctx) => {
    const ok =
      HTTPS_PREFIX.test(val) ||
      val.startsWith("/") ||
      val.startsWith("mailto:");
    if (!ok) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Must use http(s)://, a path starting with /, or mailto:",
      });
    }
  });

const socialEntrySchema = z.object({
  platform: z.string().trim().min(1, "Platform is required").max(80),
  url: flexRequiredLinkUrl,
  icon: trimToUndef(80),
  isActive: z.preprocess(
    (v) => (v === false ? false : true),
    z.boolean()
  ),
  order: z.preprocess((v) => {
    if (v === undefined || v === null || v === "") return 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }, z.number().int().min(0).max(999)),
});

const mapEmbedUrlSchema = z.preprocess(
  (v) => (v === undefined || v === null ? "" : String(v).trim()),
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
  buttonUrl: flexOptionalPublicUrl,
  isActive: z.preprocess(
    (v) => (v === true ? true : false),
    z.boolean()
  ),
});

const robotsSchema = z
  .object({
    index: z.boolean().optional().default(true),
    follow: z.boolean().optional().default(true),
  })
  .default({ index: true, follow: true });

const seoSchema = z.object({
  metaTitle: trimToUndef(70),
  metaDescription: trimToUndef(180),
  keywords: z.array(z.string().trim().min(1).max(120)).optional().default([]),
  canonicalUrl: flexOptionalPublicUrl,
  ogTitle: trimToUndef(110),
  ogDescription: trimToUndef(200),
  ogImage: mediaInputSchema,
  robots: robotsSchema,
  schemaType: trimToUndef(80),
});

const siteNameField = z.preprocess((val) => {
  const s = typeof val === "string" ? val.trim() : "";
  return s.length < 2 ? "UESPAK" : s;
}, z.string().min(2, "Site name must be at least 2 characters").max(160));

const globalCTASchemaSafe = z.preprocess(
  (v) => {
    if (v === undefined || v === null || typeof v !== "object" || Array.isArray(v)) {
      return {
        title: "",
        description: "",
        buttonText: "",
        buttonUrl: "",
        isActive: false,
      };
    }
    return v;
  },
  globalCTASchema
);

const seoSchemaSafe = z.preprocess(
  (v) => {
    if (v === undefined || v === null || typeof v !== "object" || Array.isArray(v)) {
      return {
        metaTitle: "",
        metaDescription: "",
        keywords: [],
        canonicalUrl: "",
        ogTitle: "",
        ogDescription: "",
        ogImage: undefined,
        robots: { index: true, follow: true },
        schemaType: "",
      };
    }
    return v;
  },
  seoSchema
);

/** Full CMS payload — PATCH + admin form (after normalization). */
export const siteSettingsSchema = z.object({
  key: z.literal(SITE_SETTINGS_DOCUMENT_KEY).optional(),
  siteName: siteNameField,
  tagline: trimToUndef(220),
  logo: mediaInputSchema,
  darkLogo: mediaInputSchema,
  favicon: mediaInputSchema,

  phones: z.preprocess((input) => {
    if (input === undefined || input === null) return [];
    if (!Array.isArray(input)) return [];
    return input.filter((p) => {
      if (!p || typeof p !== "object") return false;
      const val = (p as { value?: string }).value;
      return typeof val === "string" && val.trim().length > 0;
    });
  }, z.array(phoneEntrySchema).max(20).optional().default([])),

  emails: z.preprocess((input) => {
    if (input === undefined || input === null) return [];
    if (!Array.isArray(input)) return [];
    return input.filter((e) => {
      if (!e || typeof e !== "object") return false;
      const val = (e as { value?: string }).value;
      return typeof val === "string" && val.trim().length > 0;
    });
  }, z.array(emailEntrySchema).max(20).optional().default([])),

  address: trimToUndef(2000),
  workingHours: trimToUndef(500),
  mapEmbedUrl: mapEmbedUrlSchema,

  socialLinks: z.preprocess((input) => {
    if (input === undefined || input === null) return [];
    if (!Array.isArray(input)) return [];
    return input.filter((s) => {
      if (!s || typeof s !== "object") return false;
      const plat = String((s as { platform?: string }).platform ?? "").trim();
      const u = String((s as { url?: string }).url ?? "").trim();
      return plat.length > 0 && u.length > 0;
    });
  }, z.array(socialEntrySchema).max(30).optional().default([])),

  profilePdf: mediaInputSchema,
  profileButtonText: trimToUndef(120),

  footerText: trimToUndef(240),
  copyrightText: trimToUndef(400),
  footerDescription: trimToUndef(2000),

  globalCTA: globalCTASchemaSafe,
  seo: seoSchemaSafe,
});

/** Alias — PATCH upserts entire settings document using the same validation shape. */
export const siteSettingsUpdateSchema = siteSettingsSchema;

export type SiteSettingsInput = z.output<typeof siteSettingsSchema>;
