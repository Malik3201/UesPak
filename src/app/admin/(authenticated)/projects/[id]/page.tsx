import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import type { ProjectDto } from "@/types/project";
import ProjectForm from "@/components/admin/projects/ProjectForm";

export const metadata: Metadata = {
  title: "Edit Project | UESPAK Admin",
  robots: { index: false, follow: false },
};

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  await connectDB();
  const { id } = await params;
  const project = await Project.findById(id).lean();
  if (!project) notFound();

  const plainProject: Partial<ProjectDto> = {
    id: String(project._id),
    title: project.title,
    slug: project.slug,
    projectGroup:
      project.projectGroup === "agriculture"
        ? "agriculture"
        : project.projectGroup === "industrialAutomation"
          ? "industrialAutomation"
          : "engineering",
    categoryIds: (project.categoryIds ?? []).map((idObj) => String(idObj)),
    categoriesSnapshot: project.categoriesSnapshot ?? [],
    excerpt: project.excerpt,
    description: project.description,
    content: project.content,
    status: project.status,
    order: project.order ?? 0,
    isFeatured: Boolean(project.isFeatured),
    site: project.site,
    client: project.client,
    location: project.location,
    discipline: project.discipline,
    commissioningDate: project.commissioningDate
      ? new Date(project.commissioningDate).toISOString()
      : undefined,
    servicesProvided: project.servicesProvided ?? [],
    scope: project.scope,
    scopeItems: project.scopeItems ?? [],
    technologies: project.technologies ?? [],
    outcomes: project.outcomes ?? [],
    featuredImage: project.featuredImage,
    gallery: project.gallery ?? [],
    linkedServices: (project.linkedServices ?? []).map((idObj) => String(idObj)),
    cta: project.cta ?? { isActive: false },
    seo: project.seo,
    publishedAt: project.publishedAt ? new Date(project.publishedAt).toISOString() : undefined,
    createdAt: project.createdAt ? new Date(project.createdAt).toISOString() : undefined,
    updatedAt: project.updatedAt ? new Date(project.updatedAt).toISOString() : undefined,
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Project</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update project details, media, linked services, status, and SEO.
        </p>
      </div>
      <ProjectForm mode="edit" initialProject={plainProject} />
    </div>
  );
}

