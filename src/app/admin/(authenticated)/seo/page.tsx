import type { Metadata } from "next";
import SeoManagerForm from "@/components/admin/seo/SeoManagerForm";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import AdminAlert from "@/components/admin/ui/AdminAlert";

export const metadata: Metadata = {
  title: "SEO Manager",
  robots: { index: false, follow: false },
};

export default function AdminSeoPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="SEO Manager"
        description="Global SEO defaults, social sharing, robots controls, and verification settings."
      />
      <AdminAlert variant="info">
        Use your final production domain in Site URL and Canonical Base URL before enabling
        full indexing at launch.
      </AdminAlert>
      <SeoManagerForm />
    </div>
  );
}
