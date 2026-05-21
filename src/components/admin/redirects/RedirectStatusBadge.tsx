import AdminBadge from "@/components/admin/ui/AdminBadge";

export default function RedirectStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <AdminBadge tone={isActive ? "active" : "inactive"}>
      {isActive ? "Active" : "Inactive"}
    </AdminBadge>
  );
}
