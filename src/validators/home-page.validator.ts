import { z } from "zod";

const statusEnum = z.enum(["draft", "published"]);

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

const objectIdString = z
  .string()
  .trim()
  .regex(/^[a-fA-F0-9]{24}$/, "Invalid ObjectId.");

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

const simpleItemSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: trimToOptional(600),
  icon: trimToOptional(120),
  order: z.coerce.number().int().default(0),
});

const statItemSchema = z.object({
  label: z.string().trim().min(1).max(120),
  value: z.string().trim().min(1).max(120),
  suffix: trimToOptional(40),
  description: trimToOptional(300),
  order: z.coerce.number().int().default(0),
});

const industryItemSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: trimToOptional(300),
  icon: trimToOptional(120),
  order: z.coerce.number().int().default(0),
});

const clientLogoSchema = z.object({
  name: z.string().trim().min(1).max(120),
  logo: mediaObjectSchema.optional(),
  url: trimToOptional(2048),
  order: z.coerce.number().int().default(0),
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
  schemaType: trimToOptional(80).default("WebSite"),
});

export const homePageSchema = z.object({
  key: z.string().trim().default("home-page"),
  status: statusEnum.default("published"),
  hero: z
    .object({
      eyebrow: trimToOptional(120),
      title: trimToOptional(220),
      subtitle: trimToOptional(120),
      description: trimToOptional(800),
      primaryButtonText: trimToOptional(80),
      primaryButtonUrl: trimToOptional(2048),
      secondaryButtonText: trimToOptional(80),
      secondaryButtonUrl: trimToOptional(2048),
      backgroundImage: mediaObjectSchema.optional(),
      backgroundImages: z.array(mediaObjectSchema).default([]),
      foregroundImage: mediaObjectSchema.optional(),
      badges: z.array(z.string().trim().min(1).max(120)).default([]),
      isActive: z.boolean().default(true),
    })
    .default({ isActive: true, badges: [], backgroundImages: [] }),
  featuredServices: z
    .object({
      title: trimToOptional(140),
      subtitle: trimToOptional(180),
      description: trimToOptional(800),
      serviceIds: z.array(objectIdString).default([]),
      isActive: z.boolean().default(true),
    })
    .default({ serviceIds: [], isActive: true }),
  servicesOverview: z
    .object({
      eyebrow: trimToOptional(120),
      title: trimToOptional(200),
      description: trimToOptional(800),
      image: mediaObjectSchema.optional(),
      isActive: z.boolean().default(true),
    })
    .default({ isActive: true }),
  whyChooseUs: z
    .object({
      eyebrow: trimToOptional(120),
      title: trimToOptional(200),
      description: trimToOptional(800),
      items: z.array(simpleItemSchema).default([]),
      isActive: z.boolean().default(true),
    })
    .default({ items: [], isActive: true }),
  aboutPreview: z
    .object({
      eyebrow: trimToOptional(120),
      title: trimToOptional(200),
      description: trimToOptional(800),
      image: mediaObjectSchema.optional(),
      buttonText: trimToOptional(80),
      buttonUrl: trimToOptional(2048),
      isActive: z.boolean().default(true),
    })
    .default({ isActive: true }),
  visionMission: z
    .object({
      eyebrow: trimToOptional(120),
      title: trimToOptional(200),
      visionTitle: trimToOptional(120),
      visionDescription: trimToOptional(600),
      missionTitle: trimToOptional(120),
      missionDescription: trimToOptional(600),
      valuesTitle: trimToOptional(120),
      valuesDescription: trimToOptional(600),
      image: mediaObjectSchema.optional(),
      isActive: z.boolean().default(true),
    })
    .default({ isActive: true }),
  stats: z
    .object({
      title: trimToOptional(140),
      description: trimToOptional(600),
      items: z.array(statItemSchema).default([]),
      isActive: z.boolean().default(true),
    })
    .default({ items: [], isActive: true }),
  featuredProjects: z
    .object({
      title: trimToOptional(140),
      subtitle: trimToOptional(180),
      description: trimToOptional(800),
      projectIds: z.array(objectIdString).default([]),
      isActive: z.boolean().default(true),
    })
    .default({ projectIds: [], isActive: true }),
  industries: z
    .object({
      title: trimToOptional(140),
      description: trimToOptional(600),
      items: z.array(industryItemSchema).default([]),
      isActive: z.boolean().default(true),
    })
    .default({ items: [], isActive: true }),
  teamPreview: z
    .object({
      title: trimToOptional(140),
      description: trimToOptional(600),
      isActive: z.boolean().default(true),
    })
    .default({ isActive: true }),
  clients: z
    .object({
      title: trimToOptional(140),
      description: trimToOptional(600),
      logos: z.array(clientLogoSchema).default([]),
      isActive: z.boolean().default(true),
    })
    .default({ logos: [], isActive: true }),
  profileCTA: z
    .object({
      eyebrow: trimToOptional(120),
      title: trimToOptional(200),
      description: trimToOptional(600),
      buttonText: trimToOptional(80),
      isActive: z.boolean().default(true),
    })
    .default({ isActive: true }),
  contactCTA: z
    .object({
      eyebrow: trimToOptional(120),
      title: trimToOptional(200),
      description: trimToOptional(600),
      buttonText: trimToOptional(80),
      buttonUrl: trimToOptional(2048),
      isActive: z.boolean().default(true),
    })
    .default({ isActive: true }),
  seo: seoSchema.default({
    schemaType: "WebSite",
    robots: { index: true, follow: true },
    keywords: [],
  }),
});

export const homePageUpdateSchema = homePageSchema.partial();

export type HomePageInput = z.output<typeof homePageSchema>;

