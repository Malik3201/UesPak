import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { ProjectCategory } from "@/models/ProjectCategory";
import type { ProjectCategoryDto } from "@/types/project";
import ProjectCategoryForm from "@/components/admin/projects/ProjectCategoryForm";

export const metadata: Metadata = {
  title: "Edit Project Category | UESPAK Admin",
  robots: { index: false, follow: false },
};

export default async function EditProjectCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  await connectDB();
  const { id } = await params;
  const category = await ProjectCategory.findById(id).lean();
  if (!category) notFound();

  const plainCategory: Partial<ProjectCategoryDto> = {
    id: String(category._id),
    name: category.name,
    slug: category.slug,
    description: category.description,
    projectGroup: category.projectGroup,
    status: category.status,
    order: category.order ?? 0,
    seo: category.seo,
    createdAt: category.createdAt ? new Date(category.createdAt).toISOString() : undefined,
    updatedAt: category.updatedAt ? new Date(category.updatedAt).toISOString() : undefined,
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Edit Project Category
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update category details, group mapping, and SEO settings.
        </p>
      </div>
      <ProjectCategoryForm mode="edit" initialCategory={plainCategory} />
    </div>
  );
}

