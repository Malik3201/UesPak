import type { SeoSettingsDTO } from "@/types/seo-setting";

export const SEO_SETTINGS_DOCUMENT_KEY = "seo-settings";

export const DEFAULT_SEO_SETTINGS: SeoSettingsDTO = {
  siteName: "UESPAK",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://uespak.com",
  defaultMetaTitle: "UESPAK – Engineering Excellence",
  defaultMetaDescription:
    "UESPAK delivers engineering, procurement, and construction services across Pakistan and the region.",
  defaultKeywords: ["UESPAK", "engineering", "EPC", "construction", "Pakistan"],
  defaultOgTitle: "UESPAK – Engineering Excellence",
  defaultOgDescription:
    "UESPAK delivers engineering, procurement, and construction services across Pakistan and the region.",
  twitterCard: "summary_large_image",
  robots: { index: true, follow: true },
  sitemapEnabled: true,
  robotsTxtEnabled: true,
  noIndexPaths: [],
};
