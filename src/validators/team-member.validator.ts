import { z } from "zod";

const teamMemberStatusEnum = z.enum(["draft", "published", "archived"]);

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

const optionalEmail = z
  .preprocess(
    (v) => (v == null ? "" : String(v).trim()),
    z
      .string()
      .max(160)
      .transform((value) => (value === "" ? undefined : value))
      .refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
        message: "Invalid email address.",
      })
  )
  .optional();

const optionalUrl = z
  .preprocess(
    (v) => (v == null ? "" : String(v).trim()),
    z
      .string()
      .max(2048)
      .transform((value) => (value === "" ? undefined : value))
      .refine((value) => !value || /^https?:\/\//i.test(value), {
        message: "Must be a valid URL beginning with http(s)://",
      })
  )
  .optional();

const mediaObjectSchema = z.object({
  url: z.string().trim().min(1),
  publicId: z.string().trim().optional().default(""),
  fileId: z.string().trim().optional(),
  altText: trimToOptional(300),
  width: z.number().optional(),
  height: z.number().optional(),
  format: trimToOptional(50),
  size: z.number().optional(),
  mimeType: z.string().trim().optional(),
});

const socialLinkSchema = z.object({
  label: z.string().trim().min(1, "Social label is required.").max(80),
  url: z.string().trim().min(1, "Social URL is required.").max(2048),
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
  schemaType: trimToOptional(80).default("Person"),
});

export const teamMemberCreateSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(200),
  slug: lowercaseSlug.optional(),
  designation: z
    .string()
    .trim()
    .min(2, "Designation must be at least 2 characters.")
    .max(160),
  department: trimToOptional(120),
  shortBio: trimToOptional(400),
  bio: trimToOptional(20000),
  expertise: z.array(z.string().trim().min(1).max(160)).default([]),
  qualifications: z.array(z.string().trim().min(1).max(200)).default([]),
  experienceYears: z.coerce.number().int().min(0).max(80).optional(),
  image: mediaObjectSchema.optional(),
  email: optionalEmail,
  phone: trimToOptional(60),
  linkedinUrl: optionalUrl,
  socialLinks: z.array(socialLinkSchema).default([]),
  order: z.coerce.number().int().default(0),
  isFeatured: z.boolean().default(false),
  status: teamMemberStatusEnum.default("draft"),
  seo: seoSchema.optional(),
});

export const teamMemberUpdateSchema = teamMemberCreateSchema
  .partial()
  .extend({
    name: z.string().trim().min(2).max(200).optional(),
    designation: z.string().trim().min(2).max(160).optional(),
    slug: lowercaseSlug.optional(),
  });

export type TeamMemberCreateInput = z.output<typeof teamMemberCreateSchema>;
export type TeamMemberUpdateInput = z.output<typeof teamMemberUpdateSchema>;
