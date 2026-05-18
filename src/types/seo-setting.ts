import type { MediaObject } from "@/types/media";

export type TwitterCardType = "summary" | "summary_large_image";

export interface SeoSettingsRobots {
  index: boolean;
  follow: boolean;
}

export interface SeoSettingsDTO {
  siteName: string;
  siteUrl: string;
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  defaultKeywords: string[];
  defaultOgTitle: string;
  defaultOgDescription: string;
  defaultOgImage?: MediaObject;
  twitterCard: TwitterCardType;
  robots: SeoSettingsRobots;
  googleSearchConsoleVerification?: string;
  bingVerification?: string;
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  canonicalBaseUrl?: string;
  sitemapEnabled: boolean;
  robotsTxtEnabled: boolean;
  noIndexPaths: string[];
  updatedAt?: string;
}
