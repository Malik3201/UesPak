import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectDetailView from "@/components/public/projects/ProjectDetailView";
import JsonLdScripts from "@/components/public/catalog/JsonLdScripts";
import { connectDB } from "@/lib/db";
import { getAllProjectSlugs, getProjectBySlug, getProjectSeoMetadata } from "@/lib/projects";
import { getPublicSiteSettings } from "@/lib/site-settings";
import { SITE_URL } from "@/lib/seo";
import { Service } from "@/models/Service";
import {
  getProjectGroupLabel,
  getProjectGroupSlug,
} from "@/types/project";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) {
    return {
      title: "Project Not Found | UESPAK",
      robots: { index: false, follow: false },
    };
  }
  return getProjectSeoMetadata(project);
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const group =
    project.projectGroup === "agriculture"
      ? "agriculture"
      : project.projectGroup === "industrialAutomation"
        ? "industrialAutomation"
        : "engineering";
  const groupLabel = getProjectGroupLabel(group);
  const groupSlug = getProjectGroupSlug(group);

  let linkedServices: Array<{
    title: string;
    slug: string;
    excerpt?: string;
    featuredImage?: { url?: string; altText?: string };
  }> = [];

  if (project.linkedServices?.length) {
    try {
      await connectDB();
      const ids = project.linkedServices.map((idObj) => String(idObj));
      const docs = await Service.find({
        _id: { $in: ids },
        status: "published",
      })
        .select("title slug excerpt featuredImage")
        .sort({ title: 1 })
        .lean();
      linkedServices = docs.map((d) => ({
        title: d.title,
        slug: d.slug,
        excerpt: d.excerpt,
        featuredImage: d.featuredImage,
      }));
    } catch {
      linkedServices = [];
    }
  }

  const settings = await getPublicSiteSettings();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Projects", item: `${SITE_URL}/projects` },
      {
        "@type": "ListItem",
        position: 3,
        name: groupLabel,
        item: `${SITE_URL}/projects/group/${groupSlug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: project.title,
        item: `${SITE_URL}/projects/${project.slug}`,
      },
    ],
  };

  const projectJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.excerpt || project.description || "",
    creator: { "@type": "Organization", name: "UESPAK", url: SITE_URL },
    url: `${SITE_URL}/projects/${project.slug}`,
    image: project.featuredImage?.url || undefined,
    datePublished: project.commissioningDate
      ? new Date(project.commissioningDate).toISOString()
      : undefined,
    locationCreated: project.location || undefined,
  };

  return (
    <>
      <ProjectDetailView
        project={project}
        linkedServices={linkedServices}
        settings={settings}
      />
      <JsonLdScripts data={[breadcrumbJsonLd, projectJsonLd]} />
    </>
  );
}
