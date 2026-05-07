import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import ProjectsPageClient from "@/components/admin/projects/ProjectsPageClient";

export const metadata: Metadata = {
  title: "Projects | UESPAK Admin",
  robots: { index: false, follow: false },
};

export default async function AdminProjectsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return <ProjectsPageClient />;
}

