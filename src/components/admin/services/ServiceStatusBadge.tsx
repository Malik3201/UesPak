import AdminBadge, { statusToBadgeTone } from "@/components/admin/ui/AdminBadge";
import type { ServiceStatus } from "@/types/service";

export default function ServiceStatusBadge({ status }: { status: ServiceStatus }) {
  return (
    <AdminBadge tone={statusToBadgeTone(status)}>
      {status}
    </AdminBadge>
  );
}
