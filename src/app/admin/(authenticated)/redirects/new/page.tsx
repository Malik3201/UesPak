import type { Metadata } from "next";
import { redirect } from "next/navigation";
import RedirectForm from "@/components/admin/redirects/RedirectForm";
import { getCurrentAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "New Redirect | UESPAK Admin",
  robots: { index: false, follow: false },
};

export default async function AdminNewRedirectPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">New Redirect</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a URL redirect for old paths or changed slugs.
        </p>
      </div>
      <RedirectForm mode="create" />
    </div>
  );
}
