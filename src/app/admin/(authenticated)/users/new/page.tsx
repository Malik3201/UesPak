import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminUserForm from "@/components/admin/users/AdminUserForm";
import { getCurrentAdmin, hasRole } from "@/lib/auth";

export const metadata: Metadata = {
  title: "New Admin User | UESPAK Admin",
  robots: { index: false, follow: false },
};

export default async function AdminNewUserPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  if (!hasRole(admin, ["superAdmin"])) redirect("/admin/users");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">New Admin User</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new account for the admin panel.
        </p>
      </div>
      <AdminUserForm mode="create" />
    </div>
  );
}
