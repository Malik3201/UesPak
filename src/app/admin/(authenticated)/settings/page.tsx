import type { Metadata } from "next";
import SiteSettingsForm from "@/components/admin/settings/SiteSettingsForm";

export const metadata: Metadata = {
  title: "Site Settings",
  robots: { index: false, follow: false },
};

export default function AdminSiteSettingsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Site Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Global brand, contact, footer, SEO defaults, and public CTAs — used
          across the public site.
        </p>
      </div>
      <SiteSettingsForm />
    </div>
  );
}
