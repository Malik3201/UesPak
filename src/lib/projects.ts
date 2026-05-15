import type { Metadata } from "next";
import { connectDB } from "@/lib/db";
import { Project, type IProject } from "@/models/Project";
import {
  getProjectGroupLabel,
  getProjectGroupSlug,
  type ProjectGroup,
} from "@/types/project";
import { SITE_URL } from "@/lib/seo";

function projectGroupOf(project: IProject | (IProject & { projectGroup?: unknown })): ProjectGroup {
  return (project as unknown as { projectGroup?: ProjectGroup }).projectGroup ===
    "agriculture"
    ? "agriculture"
    : (project as unknown as { projectGroup?: ProjectGroup }).projectGroup ===
        "industrialAutomation"
      ? "industrialAutomation"
      : "engineering";
}

export async function getPublishedProjects(): Promise<IProject[]> {
  try {
    await connectDB();
    return await Project.find({ status: "published" })
      .sort({ order: 1, createdAt: -1 })
      .lean();
  } catch {
    return [];
  }
}

export async function getFeaturedProjects(): Promise<IProject[]> {
  try {
    await connectDB();
    return await Project.find({ status: "published", isFeatured: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();
  } catch {
    return [];
  }
}

export async function getProjectBySlug(slug: string): Promise<IProject | null> {
  try {
    await connectDB();
    return await Project.findOne({ slug, status: "published" }).lean();
  } catch {
    return null;
  }
}

export async function getPublishedProjectsByGroup(group: ProjectGroup): Promise<IProject[]> {
  try {
    await connectDB();
    const filter: Record<string, unknown> =
      group === "engineering"
        ? {
            status: "published",
            $or: [{ projectGroup: "engineering" }, { projectGroup: { $exists: false } }],
          }
        : { status: "published", projectGroup: group };

    return await Project.find(filter).sort({ order: 1, createdAt: -1 }).lean();
  } catch {
    return [];
  }
}

export async function getGroupedPublishedProjects(): Promise<{
  engineering: IProject[];
  agriculture: IProject[];
  industrialAutomation: IProject[];
}> {
  const all = await getPublishedProjects();

  const engineering: IProject[] = [];
  const agriculture: IProject[] = [];
  const industrialAutomation: IProject[] = [];

  for (const project of all) {
    const group = projectGroupOf(project);
    if (group === "agriculture") agriculture.push(project);
    else if (group === "industrialAutomation") industrialAutomation.push(project);
    else engineering.push(project);
  }

  return { engineering, agriculture, industrialAutomation };
}

export async function getProjectGroupsWithCounts(): Promise<
  Array<{ group: ProjectGroup; count: number }>
> {
  const grouped = await getGroupedPublishedProjects();
  return [
    { group: "engineering", count: grouped.engineering.length },
    { group: "agriculture", count: grouped.agriculture.length },
    { group: "industrialAutomation", count: grouped.industrialAutomation.length },
  ];
}

export async function getAllProjectSlugs(): Promise<string[]> {
  try {
    await connectDB();
    const projects = await Project.find({ status: "published" }).select("slug").lean();
    return projects.map((project) => project.slug).filter(Boolean);
  } catch {
    return [];
  }
}

export async function getProjectsLinkedToService(
  serviceId: string
): Promise<
  Array<{
    title: string;
    slug: string;
    excerpt?: string;
    projectGroup?: IProject["projectGroup"];
    featuredImage?: IProject["featuredImage"];
  }>
> {
  try {
    await connectDB();
    const docs = await Project.find({
      status: "published",
      linkedServices: serviceId,
    })
      .select("title slug excerpt featuredImage projectGroup")
      .sort({ order: 1, createdAt: -1 })
      .limit(6)
      .lean();
    return docs.map((d) => ({
      title: d.title,
      slug: d.slug,
      excerpt: d.excerpt,
      projectGroup: d.projectGroup,
      featuredImage: d.featuredImage,
    }));
  } catch {
    return [];
  }
}

export function getProjectSeoMetadata(project: IProject): Metadata {
  const url = `${SITE_URL}/projects/${project.slug}`;
  const seo = project.seo;
  const group = projectGroupOf(project);
  const groupLabel = getProjectGroupLabel(group);
  const fallbackTitle = `${project.title} | UESPAK`;
  const fallbackDescription =
    project.excerpt?.trim() ||
    `Explore this ${groupLabel.toLowerCase()} case by UESPAK.`;

  const ogMedia =
    typeof seo?.ogImage === "object" ? seo.ogImage?.url : undefined;
  const ogImage = ogMedia || project.featuredImage?.url;

  return {
    title: seo?.metaTitle?.trim() || fallbackTitle,
    description: seo?.metaDescription?.trim() || fallbackDescription,
    keywords: seo?.keywords?.length ? seo.keywords : undefined,
    alternates: {
      canonical: seo?.canonicalUrl?.trim() || url,
    },
    openGraph: {
      type: "article",
      url,
      title: seo?.ogTitle?.trim() || seo?.metaTitle?.trim() || fallbackTitle,
      description:
        seo?.ogDescription?.trim() ||
        seo?.metaDescription?.trim() ||
        fallbackDescription,
      images: ogImage ? [{ url: ogImage, alt: project.title }] : undefined,
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
      index: seo?.robots?.index !== false,
      follow: seo?.robots?.follow !== false,
    },
    other: {
      "x-project-group": getProjectGroupSlug(group),
    },
  };
}

