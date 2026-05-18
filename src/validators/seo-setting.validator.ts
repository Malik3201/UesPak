import { z } from "zod";

function trimToOptional(max = 5000) {
  return z
    .preprocess(
      (v) => (v == null ? "" : String(v).trim()),
      z
        .string()
        .max(max)
        .transform((value) => (value === "" ? undefined : value))
    )
    .optional();
}

const mediaObjectSchema = z.object({
  url: z.string().trim().min(1),
  publicId: z.string().trim().min(1),
  fileId: z.string().trim().optional(),
  altText: trimToOptional(300),
  width: z.number().optional(),
  height: z.number().optional(),
  format: trimToOptional(50),
  size: z.number().optional(),
});

export const seoSettingUpdateSchema = z.object({
  siteName: trimToOptional(120).default("UESPAK"),
  siteUrl: z.string().trim().url("Site URL must be valid.").optional().or(z.literal("")),
  defaultMetaTitle: trimToOptional(70),
  defaultMetaDescription: trimToOptional(180),
  defaultKeywords: z.array(z.string().trim().min(1).max(120)).default([]),
  defaultOgTitle: trimToOptional(110),
  defaultOgDescription: trimToOptional(180),
  defaultOgImage: mediaObjectSchema.optional(),
  twitterCard: z.enum(["summary", "summary_large_image"]).default("summary_large_image"),
  robots: z
    .object({
      index: z.boolean().default(true),
      follow: z.boolean().default(true),
    })
    .default({ index: true, follow: true }),
  googleSearchConsoleVerification: trimToOptional(200),
  bingVerification: trimToOptional(200),
  googleAnalyticsId: trimToOptional(80),
  googleTagManagerId: trimToOptional(80),
  canonicalBaseUrl: z.string().trim().url().optional().or(z.literal("")),
  sitemapEnabled: z.boolean().default(true),
  robotsTxtEnabled: z.boolean().default(true),
  noIndexPaths: z.array(z.string().trim().min(1).max(500)).default([]),
});

export type SeoSettingUpdateInput = z.infer<typeof seoSettingUpdateSchema>;
