import type { Metadata } from "next";
import { redirect } from "next/navigation";
import JobsPageClient from "@/components/admin/jobs/JobsPageClient";
import { getCurrentAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Jobs | UESPAK Admin",
  robots: { index: false, follow: false },
};

export default async function AdminJobsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return <JobsPageClient />;
}
