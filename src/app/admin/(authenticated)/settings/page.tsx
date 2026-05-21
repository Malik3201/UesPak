import type { Metadata } from "next";
import SiteSettingsForm from "@/components/admin/settings/SiteSettingsForm";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";

export const metadata: Metadata = {
  title: "Site Settings",
  robots: { index: false, follow: false },
};

export default function AdminSiteSettingsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Site Settings"
        description="Global brand, contact, footer, SEO defaults, and public CTAs used across the public site."
      />
      <SiteSettingsForm />
    </div>
  );
}
