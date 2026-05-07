import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import ProjectCategoryForm from "@/components/admin/projects/ProjectCategoryForm";

export const metadata: Metadata = {
  title: "New Project Category | UESPAK Admin",
  robots: { index: false, follow: false },
};

export default async function NewProjectCategoryPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Add Project Category</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new project category for engineering, agriculture, or industrial automation.
        </p>
      </div>
      <ProjectCategoryForm mode="create" />
    </div>
  );
}

