import AdminBadge, { statusToBadgeTone } from "@/components/admin/ui/AdminBadge";
import type { JobStatus } from "@/types/job";

export default function JobStatusBadge({ status }: { status: JobStatus }) {
  return <AdminBadge tone={statusToBadgeTone(status)}>{status}</AdminBadge>;
}
