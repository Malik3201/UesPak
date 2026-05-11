import type { TeamMemberStatus } from "@/types/team";

const toneMap: Record<TeamMemberStatus, string> = {
  draft: "border-amber-400/40 bg-amber-400/10 text-amber-700",
  published: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  archived: "border-muted-foreground/20 bg-muted text-muted-foreground",
};

export default function TeamMemberStatusBadge({
  status,
}: {
  status: TeamMemberStatus;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${toneMap[status]}`}
    >
      {status}
    </span>
  );
}
