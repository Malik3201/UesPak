import { z } from "zod";

const serviceStatusEnum = z.enum(["draft", "published", "archived"]);
const serviceGroupEnum = z.enum(["engineering", "agriculture"]);

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

const faqSchema = z.object({
  question: z.string().trim().min(1, "FAQ question is required."),
  answer: z.string().trim().min(1, "FAQ answer is required."),
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
  schemaType: trimToOptional(80).default("Service"),
});

export const serviceCreateSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters.").max(200),
  slug: lowercaseSlug.optional(),
  excerpt: trimToOptional(500),
  content: trimToOptional(50000),
  serviceGroup: serviceGroupEnum.default("engineering"),
  category: trimToOptional(120),
  icon: trimToOptional(120),
  featuredImage: mediaObjectSchema.optional(),
  gallery: z.array(mediaObjectSchema).default([]),
  order: z.coerce.number().int().default(0),
  isFeatured: z.boolean().default(false),
  status: serviceStatusEnum.default("draft"),
  bulletPoints: z.array(z.string().trim().min(1).max(400)).default([]),
  faqs: z.array(faqSchema).default([]),
  cta: ctaSchema.default({
    title: undefined,
    description: undefined,
    buttonText: undefined,
    buttonUrl: undefined,
    isActive: false,
  }),
  seo: seoSchema.optional(),
});

export const serviceUpdateSchema = serviceCreateSchema
  .partial()
  .extend({
    title: z.string().trim().min(2).max(200).optional(),
    slug: lowercaseSlug.optional(),
  });

export const serviceStatusSchema = z.object({
  status: serviceStatusEnum,
});

export type ServiceCreateInput = z.output<typeof serviceCreateSchema>;
export type ServiceUpdateInput = z.output<typeof serviceUpdateSchema>;
