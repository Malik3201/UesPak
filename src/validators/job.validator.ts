import { z } from "zod";

const jobStatusEnum = z.enum(["draft", "published", "archived"]);
const jobTypeEnum = z.enum([
  "full-time",
  "part-time",
  "contract",
  "internship",
  "remote",
]);
const workModeEnum = z.enum(["on-site", "hybrid", "remote"]);
const experienceLevelEnum = z.enum([
  "entry",
  "mid",
  "senior",
  "lead",
  "internship",
]);

const lowercaseSlug = z
  .string()
  .trim()
  .min(2, "Slug must be at least 2 characters.")
  .max(200, "Slug is too long.")
  .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only.");

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

const seoSchema = z.object({
  metaTitle: trimToOptional(70),
  metaDescription: trimToOptional(180),
  keywords: z.array(z.string().trim().min(1).max(120)).default([]),
  canonicalUrl: trimToOptional(2048),
  ogTitle: trimToOptional(110),
  ogDescription: trimToOptional(180),
  ogImage: mediaObjectSchema.optional(),
  robots: z
    .object({
      index: z.boolean().default(true),
      follow: z.boolean().default(true),
    })
    .default({ index: true, follow: true }),
  schemaType: trimToOptional(80).default("JobPosting"),
});

const stringArray = z.array(z.string().trim().min(1).max(500)).default([]);

const jobFields = {
  title: z.string().trim().min(2, "Title is required.").max(200),
  slug: lowercaseSlug.optional(),
  department: trimToOptional(120),
  location: trimToOptional(120),
  jobType: jobTypeEnum.default("full-time"),
  workMode: workModeEnum.default("on-site"),
  experienceLevel: experienceLevelEnum.default("mid"),
  experienceRequired: trimToOptional(200),
  shortDescription: trimToOptional(240),
  description: trimToOptional(50000),
  responsibilities: stringArray,
  requirements: stringArray,
  benefits: stringArray,
  skills: stringArray,
  applyEmail: z
    .string()
    .trim()
    .email("Invalid apply email.")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  applyUrl: z
    .string()
    .trim()
    .url("Invalid apply URL.")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  applicationInstructions: trimToOptional(2000),
  deadline: z
    .union([z.string().datetime(), z.string().date(), z.literal("")])
    .optional()
    .transform((v) => (v === "" || !v ? undefined : v)),
  status: jobStatusEnum.default("draft"),
  isFeatured: z.boolean().default(false),
  order: z.coerce.number().int().default(0),
  seo: seoSchema.optional(),
};

export const jobCreateSchema = z.object(jobFields);

export const jobUpdateSchema = jobCreateSchema.partial().extend({
  title: z.string().trim().min(2).max(200).optional(),
});

export type JobCreateInput = z.infer<typeof jobCreateSchema>;
export type JobUpdateInput = z.infer<typeof jobUpdateSchema>;
