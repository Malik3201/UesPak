import type { Metadata } from "next";
import { connectDB } from "@/lib/db";
import { PageContent } from "@/models/PageContent";
import {
  PAGE_SEO_FALLBACKS,
  PAGE_SLUGS,
  getDefaultPageContent,
} from "@/constants/page-content";
import type {
  AboutPageContent,
  CareersPageContent,
  ContactPageContent,
  PageKey,
  ProjectsPageContent,
  ServicesPageContent,
} from "@/types/page-content";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo";
import { getSeoDefaults, getDefaultOgImage, getCanonicalUrl } from "@/lib/seo-settings";

function normalizeObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object") return {};
  return value as Record<string, unknown>;
}

/**
 * Deep-merge defaults with the DB document. Mirrors the HomePage CMS
 * implementation: arrays are taken from the incoming value entirely (so
 * an admin clearing an array clears it), but nested objects are merged
 * recursively. Existing media objects and section blocks are preserved.
 */
function mergeDeep<T>(base: T, incoming: unknown): T {
  if (incoming == null) return base;
  if (Array.isArray(base) || Array.isArray(incoming)) {
    return (incoming as T) ?? base;
  }
  if (typeof base !== "object" || typeof incoming !== "object") {
    return (incoming as T) ?? base;
  }
  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, val] of Object.entries(incoming as Record<string, unknown>)) {
    const current = result[key];
    if (Array.isArray(val)) {
      result[key] = [...val];
    } else if (
      val &&
      typeof val === "object" &&
      current &&
      typeof current === "object" &&
      !Array.isArray(current)
    ) {
      result[key] = mergeDeep(current, val);
    } else {
      result[key] = val;
    }
  }
  return result as T;
}

export interface PageContentLoadResult<T> {
  pageContent: T;
  persisted: boolean;
}

export async function getPageContent<T>(
  pageKey: PageKey
): Promise<PageContentLoadResult<T>> {
  const defaults = getDefaultPageContent(pageKey) as unknown as T;
  try {
    await connectDB();
    const doc = await PageContent.findOne({ pageKey }).lean();
    if (!doc) return { pageContent: defaults, persisted: false };
    const merged = mergeDeep(defaults, normalizeObject(doc));
    return { pageContent: merged, persisted: true };
  } catch {
    return { pageContent: defaults, persisted: false };
  }
}

export async function getAboutPageContent() {
  return getPageContent<AboutPageContent>("about");
}

export async function getCareersPageContent() {
  return getPageContent<CareersPageContent>("careers");
}

export async function getContactPageContent() {
  return getPageContent<ContactPageContent>("contact");
}

export async function getServicesPageContent() {
  return getPageContent<ServicesPageContent>("services");
}

export async function getProjectsPageContent() {
  return getPageContent<ProjectsPageContent>("projects");
}

export function getDefaultAboutPage() {
  return getDefaultPageContent("about");
}
export function getDefaultCareersPage() {
  return getDefaultPageContent("careers");
}
export function getDefaultContactPage() {
  return getDefaultPageContent("contact");
}

interface SeoLike {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string | { url?: string; altText?: string };
  robots?: { index?: boolean; follow?: boolean };
}

interface PageContentLike {
  pageKey: PageKey;
  title?: string;
  hero?: { title?: string; description?: string };
  seo?: SeoLike;
}

/**
 * Build Next.js `Metadata` for a CMS-managed page. Uses CMS SEO fields with
 * sensible fallbacks tied to the page key. Never throws — always returns at
 * least the page-specific fallback metadata.
 */
export function getPageSeoMetadata(
  page: PageContentLike,
  options: { fallbackImage?: string } = {}
): Metadata {
  const fallbacks = PAGE_SEO_FALLBACKS[page.pageKey];
  const slug = PAGE_SLUGS[page.pageKey];
  const seoDefaults = getSeoDefaults();

  const title =
    page.seo?.metaTitle?.trim() ||
    page.hero?.title?.trim() ||
    page.title?.trim() ||
    fallbacks.title ||
    seoDefaults.defaultMetaTitle;

  const description =
    page.seo?.metaDescription?.trim() ||
    page.hero?.description?.trim() ||
    fallbacks.description ||
    seoDefaults.defaultMetaDescription;

  const canonical =
    page.seo?.canonicalUrl?.trim() ||
    getCanonicalUrl(slug) ||
    `${SITE_URL}${slug}`;

  const seoOgImage = page.seo?.ogImage;
  const seoOgImageUrl =
    typeof seoOgImage === "string" ? seoOgImage.trim() : seoOgImage?.url?.trim();
  const seoOgImageAlt =
    typeof seoOgImage === "string" ? undefined : seoOgImage?.altText;

  const ogImage =
    seoOgImageUrl ||
    options.fallbackImage ||
    getDefaultOgImage() ||
    `${SITE_URL}/og-default.png`;

  const robots = page.seo?.robots ?? seoDefaults.robots;

  return {
    title,
    description,
    keywords: page.seo?.keywords?.length
      ? page.seo.keywords
      : seoDefaults.defaultKeywords?.length
        ? seoDefaults.defaultKeywords
        : undefined,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: seoDefaults.siteName || SITE_NAME,
      title: page.seo?.ogTitle?.trim() || title,
      description: page.seo?.ogDescription?.trim() || description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: seoOgImageAlt || title,
        },
      ],
    },
    twitter: {
      card: seoDefaults.twitterCard || "summary_large_image",
      title: page.seo?.ogTitle?.trim() || title,
      description:
        page.seo?.ogDescription?.trim() || description || SITE_DESCRIPTION,
      images: [ogImage],
    },
    robots: {
      index: robots.index !== false && seoDefaults.robots.index !== false,
      follow: robots.follow !== false && seoDefaults.robots.follow !== false,
    },
  };
}
