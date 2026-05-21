import AdminBadge, { statusToBadgeTone } from "@/components/admin/ui/AdminBadge";
import type { ProjectStatus } from "@/types/project";

export default function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <AdminBadge tone={statusToBadgeTone(status)}>{status}</AdminBadge>;
}
