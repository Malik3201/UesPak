import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import ProjectForm from "@/components/admin/projects/ProjectForm";

export const metadata: Metadata = {
  title: "New Project | UESPAK Admin",
  robots: { index: false, follow: false },
};

export default async function NewProjectPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Add Project</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new project draft and publish when it is ready.
        </p>
      </div>
      <ProjectForm mode="create" />
    </div>
  );
}

