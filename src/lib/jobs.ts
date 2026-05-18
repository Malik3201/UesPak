import type { Metadata } from "next";
import { Job, type IJob } from "@/models/Job";
import { connectDB } from "@/lib/db";
import { SITE_URL } from "@/lib/seo";
import { getSeoSettings, getCanonicalUrl } from "@/lib/seo-settings";
import type { JobCardData } from "@/types/job";
import { generateSlug } from "@/lib/slug";

export async function getPublishedJobs(): Promise<IJob[]> {
  try {
    await connectDB();
    return await Job.find({ status: "published" })
      .sort({ isFeatured: -1, order: 1, createdAt: -1 })
      .lean();
  } catch {
    return [];
  }
}

export async function getFeaturedJobs(): Promise<IJob[]> {
  try {
    await connectDB();
    return await Job.find({ status: "published", isFeatured: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();
  } catch {
    return [];
  }
}

export async function getJobBySlug(slug: string): Promise<IJob | null> {
  try {
    await connectDB();
    const doc = await Job.findOne({ slug, status: "published" }).lean();
    return doc as IJob | null;
  } catch {
    return null;
  }
}

export async function getPublishedJobSlugs(): Promise<string[]> {
  try {
    await connectDB();
    const docs = await Job.find({ status: "published" }).select("slug").lean();
    return docs.map((d) => d.slug);
  } catch {
    return [];
  }
}

export async function generateUniqueJobSlug(
  title: string,
  excludeId?: string
): Promise<string> {
  await connectDB();
  let base = generateSlug(title);
  if (!base) base = "job";
  let candidate = base;
  let counter = 2;
  while (true) {
    const filter: Record<string, unknown> = { slug: candidate };
    if (excludeId) filter._id = { $ne: excludeId };
    const exists = await Job.exists(filter);
    if (!exists) return candidate;
    candidate = `${base}-${counter++}`;
  }
}

export function toJobCardData(job: IJob & { _id?: unknown }): JobCardData {
  return {
    id: String(job._id),
    title: job.title,
    slug: job.slug,
    department: job.department,
    location: job.location,
    jobType: job.jobType,
    workMode: job.workMode,
    experienceLevel: job.experienceLevel,
    experienceRequired: job.experienceRequired,
    shortDescription: job.shortDescription,
    isFeatured: job.isFeatured,
    applyEmail: job.applyEmail,
    applyUrl: job.applyUrl,
    deadline: job.deadline ? new Date(job.deadline).toISOString() : undefined,
  };
}

export async function getJobSeoMetadata(job: IJob): Promise<Metadata> {
  const defaults = await getSeoSettings();
  const jobUrl = getCanonicalUrl(`/careers/${job.slug}`, defaults);
  const seo = job.seo;
  const fallbackTitle = `${job.title} | Careers at UESPAK`;
  const fallbackDescription =
    job.shortDescription?.trim() ||
    job.description?.replace(/<[^>]+>/g, " ").slice(0, 160).trim() ||
    defaults.defaultMetaDescription;

  const ogMedia =
    typeof seo?.ogImage === "object" ? seo?.ogImage?.url : undefined;
  const defaultOg = defaults.defaultOgImage?.url;
  const ogImage = ogMedia || defaultOg || `${SITE_URL}/og-default.png`;

  const robotsIndex = seo?.robots?.index !== false && defaults.robots.index;
  const robotsFollow = seo?.robots?.follow !== false && defaults.robots.follow;

  return {
    title: seo?.metaTitle?.trim() || fallbackTitle,
    description: seo?.metaDescription?.trim() || fallbackDescription,
    keywords: seo?.keywords?.length ? seo.keywords : defaults.defaultKeywords,
    alternates: {
      canonical: seo?.canonicalUrl?.trim() || jobUrl,
    },
    openGraph: {
      type: "article",
      url: jobUrl,
      title: seo?.ogTitle?.trim() || seo?.metaTitle?.trim() || fallbackTitle,
      description:
        seo?.ogDescription?.trim() ||
        seo?.metaDescription?.trim() ||
        fallbackDescription,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: defaults.twitterCard,
      title: seo?.ogTitle?.trim() || fallbackTitle,
      description:
        seo?.ogDescription?.trim() || seo?.metaDescription?.trim() || fallbackDescription,
      images: ogImage ? [ogImage] : undefined,
    },
    robots: {
      index: robotsIndex,
      follow: robotsFollow,
    },
  };
}
