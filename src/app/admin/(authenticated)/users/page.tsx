import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminUsersPageClient from "@/components/admin/users/AdminUsersPageClient";
import { getCurrentAdmin, hasRole } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin Users | UESPAK Admin",
  robots: { index: false, follow: false },
};

export default async function AdminUsersPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  if (!hasRole(admin, ["superAdmin"])) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        Only super admins can manage admin users. Contact your site administrator if you
        need access.
      </div>
    );
  }

  return <AdminUsersPageClient currentUserId={admin.id} />;
}
