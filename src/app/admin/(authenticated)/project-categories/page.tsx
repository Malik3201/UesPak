import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import ProjectCategoriesPageClient from "@/components/admin/projects/ProjectCategoriesPageClient";

export const metadata: Metadata = {
  title: "Project Categories | UESPAK Admin",
  robots: { index: false, follow: false },
};

export default async function AdminProjectCategoriesPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return <ProjectCategoriesPageClient />;
}

