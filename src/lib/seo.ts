import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site-settings";
import { getSeoSettings } from "@/lib/seo-settings";

// ─── Site defaults ─────────────────────────────────────────────────────────────
export const SITE_NAME = "UESPAK";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://uespak.com";
export const SITE_DESCRIPTION =
  "UESPAK – Engineering Excellence. Providing world-class engineering, procurement, and construction services across Pakistan and the region.";

// ─── Default metadata ──────────────────────────────────────────────────────────
export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} – Engineering Excellence`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ["UESPAK", "engineering", "EPC", "construction", "Pakistan"],
  authors: [{ name: "UESPAK" }],
  creator: "UESPAK",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} – Engineering Excellence`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} – Engineering Excellence`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

/**
 * Applies Site Settings SEO defaults to baseline root metadata.
 * Keeps baseline values when CMS fields are unset; never throws outward.
 */
export async function mergeRootSiteMetadata(
  baseline: Metadata = defaultMetadata
): Promise<Metadata> {
  try {
    const [settings, seoMgr] = await Promise.all([getSiteSettings(), getSeoSettings()]);
    const seo = settings.seo;
    const merged: Metadata = { ...baseline };

    const metaTitle =
      seo.metaTitle?.trim() || seoMgr.defaultMetaTitle?.trim() || undefined;
    const metaDescription =
      seo.metaDescription?.trim() ||
      seoMgr.defaultMetaDescription?.trim() ||
      undefined;
    const siteLabel = settings.siteName?.trim() || seoMgr.siteName?.trim() || SITE_NAME;

    if (metaTitle) {
      merged.title = {
        default: metaTitle,
        template: `%s | ${siteLabel}`,
      };
    }

    if (metaDescription) {
      merged.description = metaDescription;
    }

    if (seo.keywords?.length) {
      merged.keywords = [...seo.keywords];
    } else if (seoMgr.defaultKeywords?.length) {
      merged.keywords = [...seoMgr.defaultKeywords];
    }

    if (seo.canonicalUrl?.trim()) {
      merged.alternates = {
        ...(typeof baseline.alternates === "object" ? baseline.alternates : {}),
        canonical: seo.canonicalUrl.trim(),
      };
    }

    const ogImageUrl =
      seo.ogImage?.url?.trim() || seoMgr.defaultOgImage?.url?.trim() || undefined;
    merged.openGraph = {
      ...(typeof baseline.openGraph === "object"
        ? (baseline.openGraph as Record<string, unknown>)
        : {}),
      url: seo.canonicalUrl?.trim() || seoMgr.siteUrl?.trim() || SITE_URL,
      siteName: siteLabel,
      title:
        seo.ogTitle?.trim() ||
        seoMgr.defaultOgTitle?.trim() ||
        seo.metaTitle?.trim() ||
        metaTitle ||
        (typeof baseline.openGraph?.title === "string"
          ? baseline.openGraph.title
          : SITE_NAME),
      description:
        seo.ogDescription?.trim() ||
        seoMgr.defaultOgDescription?.trim() ||
        seo.metaDescription?.trim() ||
        metaDescription ||
        SITE_DESCRIPTION,
      ...(ogImageUrl
        ? {
            images: [
              {
                url: ogImageUrl,
                alt: seo.ogImage?.altText ?? settings.siteName ?? SITE_NAME,
              },
            ],
          }
        : {}),
    } as Metadata["openGraph"];

    merged.twitter = {
      ...(typeof baseline.twitter === "object"
        ? (baseline.twitter as Record<string, unknown>)
        : {}),
      card: seoMgr.twitterCard || "summary_large_image",
      title:
        seo.ogTitle?.trim() ||
        seoMgr.defaultOgTitle?.trim() ||
        seo.metaTitle?.trim() ||
        metaTitle ||
        (typeof baseline.twitter?.title === "string"
          ? baseline.twitter.title
          : SITE_NAME),
      description:
        seo.ogDescription?.trim() ||
        seoMgr.defaultOgDescription?.trim() ||
        seo.metaDescription?.trim() ||
        metaDescription ||
        SITE_DESCRIPTION,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    };

    const index =
      (seo.robots?.index !== false) &&
      seoMgr.robots.index !== false;
    const follow =
      (seo.robots?.follow !== false) &&
      seoMgr.robots.follow !== false;

    merged.robots = {
      ...(typeof baseline.robots === "object"
        ? (baseline.robots as Record<string, unknown>)
        : {}),
      index,
      follow,
    };

    const verification: NonNullable<Metadata["verification"]> = {};
    if (seoMgr.googleSearchConsoleVerification?.trim()) {
      verification.google = seoMgr.googleSearchConsoleVerification.trim();
    }
    if (seoMgr.bingVerification?.trim()) {
      verification.other = {
        ...(verification.other || {}),
        "msvalidate.01": seoMgr.bingVerification.trim(),
      };
    }
    if (Object.keys(verification).length) {
      merged.verification = verification;
    }

    return merged;
  } catch {
    return baseline;
  }
}

// ─── Page metadata builder ─────────────────────────────────────────────────────
export interface PageSeoInput {
  title: string;
  description?: string;
  keywords?: string[];
  slug?: string;
  ogImage?: string;
  noIndex?: boolean;
  canonicalPath?: string;
}

export function buildMetadata(input: PageSeoInput): Metadata {
  const canonical = input.canonicalPath
    ? `${SITE_URL}${input.canonicalPath}`
    : undefined;

  const ogImage = input.ogImage ?? `${SITE_URL}/og-default.png`;

  return {
    title: input.title,
    description: input.description ?? SITE_DESCRIPTION,
    ...(input.keywords && { keywords: input.keywords }),
    ...(canonical && {
      alternates: { canonical },
    }),
    openGraph: {
      type: "website",
      url: canonical ?? SITE_URL,
      siteName: SITE_NAME,
      title: input.title,
      description: input.description ?? SITE_DESCRIPTION,
      images: [{ url: ogImage, width: 1200, height: 630, alt: input.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description ?? SITE_DESCRIPTION,
      images: [ogImage],
    },
    robots: input.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

// ─── Canonical URL helper ──────────────────────────────────────────────────────
export function canonicalUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

// ─── JSON-LD helpers (base, extend later) ─────────────────────────────────────
export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+92-XXX-XXXXXXX",
      contactType: "customer service",
    },
  };
}
