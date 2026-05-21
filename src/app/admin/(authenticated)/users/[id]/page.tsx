import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminUserForm from "@/components/admin/users/AdminUserForm";
import { getAdminUserById } from "@/lib/admin-users";
import { getCurrentAdmin, hasRole } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Edit Admin User | UESPAK Admin",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminEditUserPage({ params }: Props) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  if (!hasRole(admin, ["superAdmin"])) redirect("/admin/users");

  const { id } = await params;
  const user = await getAdminUserById(id);
  if (!user) redirect("/admin/users");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Admin User</h1>
        <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
      </div>
      <AdminUserForm mode="edit" initialUser={user} />
    </div>
  );
}
