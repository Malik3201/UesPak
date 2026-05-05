import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import ServicesPageClient from "@/components/admin/services/ServicesPageClient";

export const metadata: Metadata = {
  title: "Services | UESPAK Admin",
  robots: { index: false, follow: false },
};

export default async function AdminServicesPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return <ServicesPageClient />;
}
