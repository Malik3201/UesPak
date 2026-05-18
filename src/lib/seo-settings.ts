import type { Metadata } from "next";
import { connectDB } from "@/lib/db";
import {
  DEFAULT_SEO_SETTINGS,
  SEO_SETTINGS_DOCUMENT_KEY,
} from "@/constants/seo-settings";
import { SeoSetting, seoSettingToDTO } from "@/models/SeoSetting";
import type { SeoSettingsDTO } from "@/types/seo-setting";
import type { SeoData } from "@/types/seo";

let cached: SeoSettingsDTO | null = null;
let cacheAt = 0;
const CACHE_MS = 60_000;

export function getSeoDefaults(): SeoSettingsDTO {
  return cached ?? DEFAULT_SEO_SETTINGS;
}

export async function getSeoSettings(): Promise<SeoSettingsDTO> {
  if (cached && Date.now() - cacheAt < CACHE_MS) return cached;
  try {
    await connectDB();
    const doc = await SeoSetting.findOne({ key: SEO_SETTINGS_DOCUMENT_KEY }).lean();
    if (!doc) {
      cached = { ...DEFAULT_SEO_SETTINGS };
      cacheAt = Date.now();
      return cached;
    }
    cached = seoSettingToDTO(doc as Parameters<typeof seoSettingToDTO>[0]);
    cacheAt = Date.now();
    return cached;
  } catch {
    return { ...DEFAULT_SEO_SETTINGS };
  }
}

export function clearSeoSettingsCache(): void {
  cached = null;
  cacheAt = 0;
}

export function resolveSiteBaseUrl(settings?: SeoSettingsDTO): string {
  const s = settings ?? getSeoDefaults();
  const base =
    s.canonicalBaseUrl?.trim() ||
    s.siteUrl?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    DEFAULT_SEO_SETTINGS.siteUrl;
  return base.replace(/\/$/, "");
}

export function getCanonicalUrl(path: string, settings?: SeoSettingsDTO): string {
  const base = resolveSiteBaseUrl(settings);
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function getDefaultOgImage(settings?: SeoSettingsDTO): string | undefined {
  const s = settings ?? getSeoDefaults();
  return s.defaultOgImage?.url?.trim() || undefined;
}

export function shouldNoIndexPath(path: string, settings?: SeoSettingsDTO): boolean {
  const s = settings ?? getSeoDefaults();
  const normalized = path.split("?")[0] || "/";
  return (s.noIndexPaths || []).some((p) => {
    const rule = p.trim();
    if (!rule) return false;
    if (rule.endsWith("*")) {
      return normalized.startsWith(rule.slice(0, -1));
    }
    return normalized === rule || normalized.startsWith(`${rule}/`);
  });
}

export interface PageMetadataInput {
  title?: string;
  description?: string;
  path: string;
  seo?: Partial<SeoData>;
  ogImage?: string;
}

/** Merge page-level SEO with global SEO Manager defaults. */
export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const defaults = getSeoDefaults();
  const base = resolveSiteBaseUrl(defaults);
  const canonical = input.seo?.canonicalUrl?.trim() || getCanonicalUrl(input.path, defaults);

  const title =
    input.seo?.metaTitle?.trim() ||
    input.title?.trim() ||
    defaults.defaultMetaTitle;
  const description =
    input.seo?.metaDescription?.trim() ||
    input.description?.trim() ||
    defaults.defaultMetaDescription;

  const ogImage =
    (typeof input.seo?.ogImage === "object" ? input.seo.ogImage.url : undefined) ||
    input.ogImage ||
    getDefaultOgImage(defaults) ||
    `${base}/og-default.png`;

  const index =
    input.seo?.robots?.index !== false &&
    defaults.robots.index &&
    !shouldNoIndexPath(input.path, defaults);
  const follow = input.seo?.robots?.follow !== false && defaults.robots.follow;

  return {
    title,
    description,
    keywords: input.seo?.keywords?.length ? input.seo.keywords : defaults.defaultKeywords,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: defaults.siteName,
      title: input.seo?.ogTitle?.trim() || title,
      description: input.seo?.ogDescription?.trim() || description,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: defaults.twitterCard,
      title: input.seo?.ogTitle?.trim() || title,
      description: input.seo?.ogDescription?.trim() || description,
      images: ogImage ? [ogImage] : undefined,
    },
    robots: { index, follow },
  };
}
