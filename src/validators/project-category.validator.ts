import { z } from "zod";

const categoryStatusEnum = z.enum(["active", "inactive", "archived"]);
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
  schemaType: trimToOptional(80).default("CollectionPage"),
});

export const projectCategoryCreateSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(120),
  slug: lowercaseSlug.optional(),
  description: trimToOptional(500),
  projectGroup: projectGroupEnum.optional(),
  order: z.coerce.number().int().default(0),
  status: categoryStatusEnum.default("active"),
  seo: seoSchema.optional(),
});

export const projectCategoryUpdateSchema = projectCategoryCreateSchema
  .partial()
  .extend({
    name: z.string().trim().min(2).max(120).optional(),
    slug: lowercaseSlug.optional(),
  });

export type ProjectCategoryCreateInput = z.output<
  typeof projectCategoryCreateSchema
>;
export type ProjectCategoryUpdateInput = z.output<
  typeof projectCategoryUpdateSchema
>;

