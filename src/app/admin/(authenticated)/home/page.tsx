import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import HomePageForm from "@/components/admin/home/HomePageForm";

export const metadata: Metadata = {
  title: "Home Page | UESPAK Admin",
  robots: { index: false, follow: false },
};

export default async function AdminHomePage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Home Page</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage hero, featured sections, highlights, CTAs, and homepage SEO.
        </p>
      </div>
      <HomePageForm />
    </div>
  );
}

