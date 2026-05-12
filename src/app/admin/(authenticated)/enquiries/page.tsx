import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import EnquiriesManager from "@/components/admin/enquiries/EnquiriesManager";

export const metadata: Metadata = {
  title: "Enquiries | UESPAK Admin",
  robots: { index: false, follow: false },
};

export default async function AdminEnquiriesPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Enquiries
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review contact-page submissions, update status and reply to leads.
        </p>
      </div>
      <EnquiriesManager />
    </div>
  );
}
