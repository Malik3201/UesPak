import type { Metadata } from "next";
import { Service, type IService } from "@/models/Service";
import { connectDB } from "@/lib/db";
import { SITE_URL } from "@/lib/seo";
import type { ServiceGroup } from "@/types/service";

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

function getServiceGroupValue(service: Pick<IService, "serviceGroup"> | (IService & { serviceGroup?: unknown })): ServiceGroup {
  return (service as unknown as { serviceGroup?: ServiceGroup }).serviceGroup === "agriculture"
    ? "agriculture"
    : "engineering";
}

export async function getPublishedServicesByGroup(
  group: ServiceGroup
): Promise<IService[]> {
  try {
    await connectDB();
    const filter: Record<string, unknown> =
      group === "engineering"
        ? {
            status: "published",
            $or: [
              { serviceGroup: "engineering" },
              { serviceGroup: { $exists: false } },
            ],
          }
        : { status: "published", serviceGroup: "agriculture" };

    return await Service.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .lean();
  } catch {
    return [];
  }
}

export async function getGroupedPublishedServices(): Promise<{
  engineering: IService[];
  agriculture: IService[];
}> {
  const [all] = await Promise.all([getPublishedServices()]);

  const engineering: IService[] = [];
  const agriculture: IService[] = [];

  for (const service of all) {
    const group = getServiceGroupValue(service as unknown as IService);
    if (group === "agriculture") agriculture.push(service);
    else engineering.push(service);
  }

  return { engineering, agriculture };
}

export async function getServiceGroupsWithCounts(): Promise<
  Array<{ group: ServiceGroup; count: number }>
> {
  const grouped = await getGroupedPublishedServices();
  return [
    { group: "engineering", count: grouped.engineering.length },
    { group: "agriculture", count: grouped.agriculture.length },
  ];
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

export function getServiceGroup(service: Pick<IService, "serviceGroup">): ServiceGroup {
  return getServiceGroupValue(service);
}

export async function getRelatedPublishedServices(
  group: ServiceGroup,
  excludeSlug: string,
  limit = 4
): Promise<Array<{ title: string; slug: string; excerpt?: string; featuredImage?: IService["featuredImage"] }>> {
  try {
    await connectDB();
    const filter: Record<string, unknown> =
      group === "engineering"
        ? {
            status: "published",
            slug: { $ne: excludeSlug },
            $or: [{ serviceGroup: "engineering" }, { serviceGroup: { $exists: false } }],
          }
        : {
            status: "published",
            slug: { $ne: excludeSlug },
            serviceGroup: "agriculture",
          };

    const docs = await Service.find(filter)
      .select("title slug excerpt featuredImage")
      .sort({ order: 1, createdAt: -1 })
      .limit(limit)
      .lean();

    return docs.map((d) => ({
      title: d.title,
      slug: d.slug,
      excerpt: d.excerpt,
      featuredImage: d.featuredImage,
    }));
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
