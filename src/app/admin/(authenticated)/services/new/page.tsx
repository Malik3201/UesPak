import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ServiceForm from "@/components/admin/services/ServiceForm";
import { getCurrentAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "New Service | UESPAK Admin",
  robots: { index: false, follow: false },
};

export default async function NewServicePage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Add Service</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new service draft or publish it when ready.
        </p>
      </div>
      <ServiceForm mode="create" />
    </div>
  );
}
