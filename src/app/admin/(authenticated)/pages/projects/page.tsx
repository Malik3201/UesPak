import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import PageContentForm from "@/components/admin/pages/PageContentForm";

export const metadata: Metadata = {
  title: "Projects Page | UESPAK Admin",
  robots: { index: false, follow: false },
};

export default async function AdminProjectsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Projects Page
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage the public /projects listing page hero, intro, CTA, media and SEO.
          Individual projects are managed under Projects.
        </p>
      </div>
      <PageContentForm pageKey="projects" />
    </div>
  );
}
