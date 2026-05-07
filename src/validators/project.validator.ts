import { z } from "zod";

const projectStatusEnum = z.enum(["draft", "published", "archived"]);
const projectGroupEnum = z.enum([
  "engineering",
  "agriculture",
  "industrialAutomation",
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

const ctaSchema = z.object({
  title: trimToOptional(120),
  description: trimToOptional(300),
  buttonText: trimToOptional(80),
  buttonUrl: trimToOptional(2048),
  isActive: z.boolean().default(false),
});

const seoSchema = z.object({
  metaTitle: trimToOptional(70),
  metaDescription: trimToOptional(180),
  keywords: z.array(z.string().trim().min(1).max(120)).default([]),
  canonicalUrl: trimToOptional(2048),
  ogTitle: trimToOptional(110),
  ogDescription: trimToOptional(200),
  ogImage: mediaObjectSchema.optional(),
  robots: z
    .object({
      index: z.boolean().default(true),
      follow: z.boolean().default(true),
    })
    .default({ index: true, follow: true }),
  schemaType: trimToOptional(80).default("CreativeWork"),
});

const objectIdString = z
  .string()
  .trim()
  .regex(/^[a-fA-F0-9]{24}$/, "Invalid ObjectId.");

const categorySnapshotSchema = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(1).max(120),
  slug: lowercaseSlug,
});

export const projectCreateSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters.").max(200),
  slug: lowercaseSlug.optional(),
  projectGroup: projectGroupEnum.default("engineering"),
  categoryIds: z.array(objectIdString).default([]),
  categoriesSnapshot: z.array(categorySnapshotSchema).default([]),
  excerpt: trimToOptional(500),
  description: trimToOptional(1200),
  content: trimToOptional(80000),
  site: trimToOptional(200),
  client: trimToOptional(200),
  location: trimToOptional(200),
  discipline: trimToOptional(200),
  commissioningDate: z.coerce.date().optional(),
  servicesProvided: z.array(z.string().trim().min(1).max(200)).default([]),
  scope: trimToOptional(3000),
  scopeItems: z.array(z.string().trim().min(1).max(400)).default([]),
  technologies: z.array(z.string().trim().min(1).max(200)).default([]),
  outcomes: z.array(z.string().trim().min(1).max(400)).default([]),
  featuredImage: mediaObjectSchema.optional(),
  gallery: z.array(mediaObjectSchema).default([]),
  linkedServices: z.array(objectIdString).default([]),
  status: projectStatusEnum.default("draft"),
  order: z.coerce.number().int().default(0),
  isFeatured: z.boolean().default(false),
  cta: ctaSchema.default({
    title: undefined,
    description: undefined,
    buttonText: undefined,
    buttonUrl: undefined,
    isActive: false,
  }),
  seo: seoSchema.optional(),
});

export const projectUpdateSchema = projectCreateSchema.partial().extend({
  title: z.string().trim().min(2).max(200).optional(),
  slug: lowercaseSlug.optional(),
});

export const projectStatusSchema = z.object({
  status: projectStatusEnum,
});

export type ProjectCreateInput = z.output<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.output<typeof projectUpdateSchema>;
