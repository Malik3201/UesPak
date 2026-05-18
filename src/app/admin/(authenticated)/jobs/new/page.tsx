import type { Metadata } from "next";
import { redirect } from "next/navigation";
import JobForm from "@/components/admin/jobs/JobForm";
import { getCurrentAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "New Job | UESPAK Admin",
  robots: { index: false, follow: false },
};

export default async function NewJobPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">New Job</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a job opening for the public careers page.
        </p>
      </div>
      <JobForm mode="create" />
    </div>
  );
}
