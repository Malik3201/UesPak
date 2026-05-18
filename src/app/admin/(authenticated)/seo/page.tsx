import type { Metadata } from "next";
import SeoManagerForm from "@/components/admin/seo/SeoManagerForm";

export const metadata: Metadata = {
  title: "SEO Manager",
  robots: { index: false, follow: false },
};

export default function AdminSeoPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">SEO Manager</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Global SEO defaults, social sharing fallbacks, robots controls, and verification
          settings used across the public site.
        </p>
      </div>
      <SeoManagerForm />
    </div>
  );
}
