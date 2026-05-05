import type { Metadata } from "next";
import { Service, type IService } from "@/models/Service";
import { connectDB } from "@/lib/db";
import { SITE_URL } from "@/lib/seo";

export async function getPublishedServices(): Promise<IService[]> {
  try {
    await connectDB();
    return await Service.find({ status: "published" })
      .sort({ order: 1, createdAt: -1 })
      .lean();
  } catch {
    return [];
  }
}

export async function getFeaturedServices(): Promise<IService[]> {
  try {
    await connectDB();
    return await Service.find({ status: "published", isFeatured: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();
  } catch {
    return [];
  }
}

export async function getServiceBySlug(slug: string): Promise<IService | null> {
  try {
    await connectDB();
    return await Service.findOne({ slug, status: "published" }).lean();
  } catch {
    return null;
  }
}

export async function getAllServiceSlugs(): Promise<string[]> {
  try {
    await connectDB();
    const services = await Service.find({ status: "published" })
      .select("slug")
      .lean();
    return services.map((service) => service.slug).filter(Boolean);
  } catch {
    return [];
  }
}

export function getServiceSeoMetadata(service: IService): Metadata {
  const serviceUrl = `${SITE_URL}/services/${service.slug}`;
  const seo = service.seo;
  const fallbackTitle = `${service.title} | UESPAK`;
  const fallbackDescription =
    service.excerpt?.trim() || "Explore this UESPAK service offering.";
  const ogMedia =
    typeof seo?.ogImage === "object"
      ? seo?.ogImage?.url
      : undefined;
  const ogImage = ogMedia || service.featuredImage?.url;

  const robotsIndex = seo?.robots?.index !== false;
  const robotsFollow = seo?.robots?.follow !== false;

  return {
    title: seo?.metaTitle?.trim() || fallbackTitle,
    description: seo?.metaDescription?.trim() || fallbackDescription,
    keywords: seo?.keywords?.length ? seo.keywords : undefined,
    alternates: {
      canonical: seo?.canonicalUrl?.trim() || serviceUrl,
    },
    openGraph: {
      type: "article",
      url: serviceUrl,
      title: seo?.ogTitle?.trim() || seo?.metaTitle?.trim() || fallbackTitle,
      description:
        seo?.ogDescription?.trim() ||
        seo?.metaDescription?.trim() ||
        fallbackDescription,
      images: ogImage ? [{ url: ogImage, alt: service.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.ogTitle?.trim() || seo?.metaTitle?.trim() || fallbackTitle,
      description:
        seo?.ogDescription?.trim() ||
        seo?.metaDescription?.trim() ||
        fallbackDescription,
      images: ogImage ? [ogImage] : undefined,
    },
    robots: {
      index: robotsIndex,
      follow: robotsFollow,
    },
  };
}
