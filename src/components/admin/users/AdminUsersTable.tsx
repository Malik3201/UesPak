import Link from "next/link";
import AdminUserStatusBadge from "@/components/admin/users/AdminUserStatusBadge";
import { Button } from "@/components/shared/Button";
import type { AdminUserDto } from "@/types/admin-user";
import { ADMIN_ROLE_LABELS } from "@/types/admin-user";

interface AdminUsersTableProps {
  users: AdminUserDto[];
  currentUserId?: string;
  onDisable: (id: string) => void;
}

export default function AdminUsersTable({
  users,
  currentUserId,
  onDisable,
}: AdminUsersTableProps) {
  if (!users.length) {
    return (
      <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No admin users found.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-border bg-muted/40">
          <tr>
            <th className="px-4 py-3 font-semibold">Name</th>
            <th className="px-4 py-3 font-semibold">Email</th>
            <th className="px-4 py-3 font-semibold">Role</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Last login</th>
            <th className="px-4 py-3 font-semibold">Created</th>
            <th className="px-4 py-3 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-border/60 last:border-0">
              <td className="px-4 py-3 font-medium">{u.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
              <td className="px-4 py-3">{ADMIN_ROLE_LABELS[u.role]}</td>
              <td className="px-4 py-3">
                <AdminUserStatusBadge status={u.status} />
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "—"}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Link href={`/admin/users/${u.id}`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  {u.status === "active" && u.id !== currentUserId ? (
                    <Button variant="ghost" size="sm" onClick={() => onDisable(u.id)}>
                      Disable
                    </Button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
