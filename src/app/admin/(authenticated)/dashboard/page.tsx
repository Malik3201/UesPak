import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { getCurrentAdmin } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard";

export const metadata: Metadata = {
  title: "Dashboard | UESPAK Admin",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const data = await getDashboardData();

  return <AdminDashboard admin={admin} data={data} />;
}
