import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site-settings";

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
    const settings = await getSiteSettings();
    const seo = settings.seo;
    const merged: Metadata = { ...baseline };

    if (seo.metaTitle?.trim()) {
      merged.title = {
        default: seo.metaTitle.trim(),
        template: `%s | ${settings.siteName?.trim() || SITE_NAME}`,
      };
    }

    if (seo.metaDescription?.trim()) {
      merged.description = seo.metaDescription.trim();
    }

    if (seo.keywords?.length) {
      merged.keywords = [...seo.keywords];
    }

    if (seo.canonicalUrl?.trim()) {
      merged.alternates = {
        ...(typeof baseline.alternates === "object" ? baseline.alternates : {}),
        canonical: seo.canonicalUrl.trim(),
      };
    }

    const ogImageUrl = seo.ogImage?.url?.trim();
    merged.openGraph = {
      ...(typeof baseline.openGraph === "object"
        ? (baseline.openGraph as Record<string, unknown>)
        : {}),
      url: seo.canonicalUrl?.trim() ?? SITE_URL,
      siteName: settings.siteName?.trim() ?? SITE_NAME,
      title:
        seo.ogTitle?.trim() ??
        seo.metaTitle?.trim() ??
        (typeof baseline.openGraph?.title === "string"
          ? baseline.openGraph.title
          : SITE_NAME),
      description:
        seo.ogDescription?.trim() ??
        seo.metaDescription?.trim() ??
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
      card: "summary_large_image",
      title:
        seo.ogTitle?.trim() ??
        seo.metaTitle?.trim() ??
        (typeof baseline.twitter?.title === "string"
          ? baseline.twitter.title
          : SITE_NAME),
      description:
        seo.ogDescription?.trim() ??
        seo.metaDescription?.trim() ??
        SITE_DESCRIPTION,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    };

    merged.robots =
      seo.robots && typeof seo.robots === "object"
        ? {
            ...(typeof baseline.robots === "object"
              ? (baseline.robots as Record<string, unknown>)
              : {}),
            index: seo.robots.index !== false,
            follow: seo.robots.follow !== false,
          }
        : baseline.robots;

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
