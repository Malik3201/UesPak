import AdminBadge from "@/components/admin/ui/AdminBadge";
import type { AdminStatus } from "@/types/admin";

export default function AdminUserStatusBadge({ status }: { status: AdminStatus }) {
  const tone =
    status === "active" ? "active" : status === "suspended" ? "draft" : "inactive";
  return <AdminBadge tone={tone}>{status}</AdminBadge>;
}
