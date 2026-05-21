import { cn } from "@/lib/utils";
import type { AdminStatus } from "@/types/admin";
import { ADMIN_STATUS_LABELS } from "@/types/admin-user";

interface AdminUserStatusBadgeProps {
  status: AdminStatus;
}

export default function AdminUserStatusBadge({ status }: AdminUserStatusBadgeProps) {
  const active = status === "active";
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
        active
          ? "bg-emerald-100 text-emerald-800"
          : status === "suspended"
            ? "bg-amber-100 text-amber-800"
            : "bg-slate-100 text-slate-600"
      )}
    >
      {ADMIN_STATUS_LABELS[status]}
    </span>
  );
}
