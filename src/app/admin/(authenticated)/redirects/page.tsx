import type { Metadata } from "next";
import { redirect } from "next/navigation";
import RedirectsPageClient from "@/components/admin/redirects/RedirectsPageClient";
import { getCurrentAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Redirects | UESPAK Admin",
  robots: { index: false, follow: false },
};

export default async function AdminRedirectsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return <RedirectsPageClient />;
}
