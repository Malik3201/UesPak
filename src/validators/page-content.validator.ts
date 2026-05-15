import { z } from "zod";
import { PAGE_KEYS, type PageKey } from "@/types/page-content";

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

const mediaObjectSchema = z
  .object({
    url: z.string().trim().min(1),
    publicId: z.string().trim().optional().default(""),
    fileId: z.string().trim().optional().default(""),
    altText: z.string().trim().max(300).optional().default(""),
    width: z.number().optional(),
    height: z.number().optional(),
    format: z.string().trim().max(50).optional(),
    size: z.number().optional(),
    mimeType: z.string().trim().max(120).optional(),
  })
  .transform((m) => {
    const pid =
      (m.publicId && String(m.publicId).trim()) ||
      (m.fileId && String(m.fileId).trim()) ||
      "";
    return { ...m, publicId: pid };
  });

const simpleItemSchema = z.object({
  title: z.string().trim().min(1).max(180),
  description: trimToOptional(800),
  icon: trimToOptional(120),
  order: z.coerce.number().int().default(0),
});

const seoSchemaBase = z.object({
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
  schemaType: trimToOptional(80),
});

const heroSchema = z
  .object({
    eyebrow: trimToOptional(160),
    title: trimToOptional(220),
    description: trimToOptional(800),
    backgroundImage: mediaObjectSchema.optional(),
    overlayOpacity: z.coerce.number().min(0).max(1).optional(),
    primaryButtonText: trimToOptional(80),
    primaryButtonUrl: trimToOptional(2048),
    secondaryButtonText: trimToOptional(80),
    secondaryButtonUrl: trimToOptional(2048),
  })
  .default({});

const catalogListingSectionsSchema = z.object({
  intro: z
    .object({
      title: trimToOptional(200),
      description: trimToOptional(800),
      showGroupTabs: z.boolean().default(true),
      isActive: z.boolean().default(true),
    })
    .default({ showGroupTabs: true, isActive: true }),
  cta: z
    .object({
      title: trimToOptional(200),
      description: trimToOptional(800),
      buttonText: trimToOptional(80),
      buttonUrl: trimToOptional(2048),
      backgroundImage: mediaObjectSchema.optional(),
      isActive: z.boolean().default(true),
    })
    .default({ isActive: true }),
});

const groupPageHeroSchema = z.object({
  title: trimToOptional(200),
  description: trimToOptional(800),
  backgroundImage: mediaObjectSchema.optional(),
  overlayOpacity: z.coerce.number().min(0).max(1).optional(),
  metaTitle: trimToOptional(70),
  metaDescription: trimToOptional(180),
});

const servicesCatalogSectionsSchema = catalogListingSectionsSchema.extend({
  serviceGroups: z
    .object({
      engineering: groupPageHeroSchema.default({}),
      agriculture: groupPageHeroSchema.default({}),
    })
    .default({ engineering: {}, agriculture: {} }),
});

const projectsCatalogSectionsSchema = catalogListingSectionsSchema.extend({
  projectGroups: z
    .object({
      engineering: groupPageHeroSchema.default({}),
      agriculture: groupPageHeroSchema.default({}),
      industrialAutomation: groupPageHeroSchema.default({}),
    })
    .default({ engineering: {}, agriculture: {}, industrialAutomation: {} }),
});

// ─── About page ───────────────────────────────────────────────────────────────
const aboutSectionsSchema = z
  .object({
    overview: z
      .object({
        eyebrow: trimToOptional(120),
        title: trimToOptional(200),
        description: trimToOptional(1500),
        image: mediaObjectSchema.optional(),
        highlights: z
          .array(z.string().trim().min(1).max(200))
          .default([]),
        isActive: z.boolean().default(true),
      })
      .default({ isActive: true, highlights: [] }),
    story: z
      .object({
        eyebrow: trimToOptional(120),
        title: trimToOptional(200),
        description: trimToOptional(2000),
        image: mediaObjectSchema.optional(),
        badgeImage: mediaObjectSchema.optional(),
        isActive: z.boolean().default(true),
      })
      .default({ isActive: true }),
    visionMission: z
      .object({
        eyebrow: trimToOptional(120),
        title: trimToOptional(200),
        visionTitle: trimToOptional(120),
        visionDescription: trimToOptional(800),
        missionTitle: trimToOptional(120),
        missionDescription: trimToOptional(800),
        valuesTitle: trimToOptional(120),
        valuesDescription: trimToOptional(800),
        values: z.array(simpleItemSchema).default([]),
        isActive: z.boolean().default(true),
      })
      .default({ isActive: true, values: [] }),
    capabilities: z
      .object({
        eyebrow: trimToOptional(120),
        title: trimToOptional(200),
        description: trimToOptional(800),
        items: z.array(simpleItemSchema).default([]),
        isActive: z.boolean().default(true),
      })
      .default({ isActive: true, items: [] }),
    whyChoose: z
      .object({
        eyebrow: trimToOptional(120),
        title: trimToOptional(200),
        description: trimToOptional(800),
        items: z.array(simpleItemSchema).default([]),
        isActive: z.boolean().default(true),
      })
      .default({ isActive: true, items: [] }),
    cta: z
      .object({
        eyebrow: trimToOptional(120),
        title: trimToOptional(200),
        description: trimToOptional(800),
        buttonText: trimToOptional(80),
        buttonUrl: trimToOptional(2048),
        backgroundImage: mediaObjectSchema.optional(),
        isActive: z.boolean().default(true),
      })
      .default({ isActive: true }),
  });

export const aboutPageSchema = z.object({
  pageKey: z.literal("about").default("about"),
  title: trimToOptional(180).default("About UESPAK"),
  slug: trimToOptional(220).default("/about-us"),
  isActive: z.boolean().default(true),
  hero: heroSchema,
  sections: aboutSectionsSchema,
  seo: seoSchemaBase.default({
    schemaType: "AboutPage",
    robots: { index: true, follow: true },
    keywords: [],
  }),
});

// ─── Careers page ─────────────────────────────────────────────────────────────
const careersSectionsSchema = z
  .object({
    intro: z
      .object({
        eyebrow: trimToOptional(120),
        title: trimToOptional(200),
        description: trimToOptional(1500),
        image: mediaObjectSchema.optional(),
        isActive: z.boolean().default(true),
      })
      .default({ isActive: true }),
    whyWork: z
      .object({
        eyebrow: trimToOptional(120),
        title: trimToOptional(200),
        description: trimToOptional(800),
        items: z.array(simpleItemSchema).default([]),
        isActive: z.boolean().default(true),
      })
      .default({ isActive: true, items: [] }),
    culture: z
      .object({
        eyebrow: trimToOptional(120),
        title: trimToOptional(200),
        description: trimToOptional(800),
        values: z.array(simpleItemSchema).default([]),
        isActive: z.boolean().default(true),
      })
      .default({ isActive: true, values: [] }),
    teamIntro: z
      .object({
        eyebrow: trimToOptional(120),
        title: trimToOptional(200),
        description: trimToOptional(800),
        showTeamMembers: z.boolean().default(true),
        isActive: z.boolean().default(true),
      })
      .default({ isActive: true, showTeamMembers: true }),
    applyCTA: z
      .object({
        eyebrow: trimToOptional(120),
        title: trimToOptional(200),
        description: trimToOptional(800),
        buttonText: trimToOptional(80),
        buttonUrl: trimToOptional(2048),
        email: trimToOptional(160),
        backgroundImage: mediaObjectSchema.optional(),
        isActive: z.boolean().default(true),
      })
      .default({ isActive: true }),
  });

export const careersPageSchema = z.object({
  pageKey: z.literal("careers").default("careers"),
  title: trimToOptional(180).default("Careers at UESPAK"),
  slug: trimToOptional(220).default("/careers"),
  isActive: z.boolean().default(true),
  hero: heroSchema,
  sections: careersSectionsSchema,
  seo: seoSchemaBase.default({
    schemaType: "WebPage",
    robots: { index: true, follow: true },
    keywords: [],
  }),
});

// ─── Contact page ─────────────────────────────────────────────────────────────
const contactSectionsSchema = z
  .object({
    info: z
      .object({
        eyebrow: trimToOptional(120),
        title: trimToOptional(200),
        description: trimToOptional(800),
        phone: trimToOptional(80),
        email: trimToOptional(160),
        address: trimToOptional(400),
        workingHours: trimToOptional(200),
        isActive: z.boolean().default(true),
      })
      .default({ isActive: true }),
    form: z
      .object({
        eyebrow: trimToOptional(120),
        title: trimToOptional(200),
        description: trimToOptional(800),
        submitButtonText: trimToOptional(80),
        successMessage: trimToOptional(400),
        serviceOptions: z
          .array(z.string().trim().min(1).max(160))
          .default([]),
        isActive: z.boolean().default(true),
      })
      .default({ isActive: true, serviceOptions: [] }),
    map: z
      .object({
        eyebrow: trimToOptional(120),
        title: trimToOptional(200),
        description: trimToOptional(800),
        embedUrl: trimToOptional(4096),
        isActive: z.boolean().default(true),
      })
      .default({ isActive: true }),
    support: z
      .object({
        eyebrow: trimToOptional(120),
        title: trimToOptional(200),
        description: trimToOptional(800),
        items: z.array(simpleItemSchema).default([]),
        isActive: z.boolean().default(true),
      })
      .default({ isActive: true, items: [] }),
  });

export const contactPageSchema = z.object({
  pageKey: z.literal("contact").default("contact"),
  title: trimToOptional(180).default("Contact UESPAK"),
  slug: trimToOptional(220).default("/contact-us"),
  isActive: z.boolean().default(true),
  hero: heroSchema,
  sections: contactSectionsSchema,
  seo: seoSchemaBase.default({
    schemaType: "ContactPage",
    robots: { index: true, follow: true },
    keywords: [],
  }),
});

export const servicesPageSchema = z.object({
  pageKey: z.literal("services").default("services"),
  title: trimToOptional(180).default("Services Page"),
  slug: trimToOptional(220).default("/services"),
  isActive: z.boolean().default(true),
  hero: heroSchema,
  sections: servicesCatalogSectionsSchema,
  seo: seoSchemaBase.default({
    schemaType: "CollectionPage",
    robots: { index: true, follow: true },
    keywords: [],
  }),
});

export const projectsPageSchema = z.object({
  pageKey: z.literal("projects").default("projects"),
  title: trimToOptional(180).default("Projects Page"),
  slug: trimToOptional(220).default("/projects"),
  isActive: z.boolean().default(true),
  hero: heroSchema,
  sections: projectsCatalogSectionsSchema,
  seo: seoSchemaBase.default({
    schemaType: "CollectionPage",
    robots: { index: true, follow: true },
    keywords: [],
  }),
});

export function getPageSchemaFor(pageKey: PageKey) {
  switch (pageKey) {
    case "about":
      return aboutPageSchema;
    case "careers":
      return careersPageSchema;
    case "contact":
      return contactPageSchema;
    case "services":
      return servicesPageSchema;
    case "projects":
      return projectsPageSchema;
  }
}

export function isValidPageKey(value: unknown): value is PageKey {
  return (
    typeof value === "string" &&
    (PAGE_KEYS as readonly string[]).includes(value)
  );
}

export type AboutPageInput = z.output<typeof aboutPageSchema>;
export type CareersPageInput = z.output<typeof careersPageSchema>;
export type ContactPageInput = z.output<typeof contactPageSchema>;
export type ServicesPageInput = z.output<typeof servicesPageSchema>;
export type ProjectsPageInput = z.output<typeof projectsPageSchema>;
