import { cn } from "@/lib/utils";

type BadgeTone =
  | "published"
  | "draft"
  | "archived"
  | "new"
  | "read"
  | "replied"
  | "active"
  | "inactive"
  | "default";

const tones: Record<BadgeTone, string> = {
  published: "bg-emerald-100 text-emerald-800 ring-emerald-600/15",
  draft: "bg-amber-100 text-amber-800 ring-amber-600/15",
  archived: "bg-slate-100 text-slate-600 ring-slate-500/15",
  new: "bg-sky-100 text-sky-800 ring-sky-600/15",
  read: "bg-slate-100 text-slate-700 ring-slate-500/15",
  replied: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  active: "bg-emerald-100 text-emerald-800 ring-emerald-600/15",
  inactive: "bg-slate-100 text-slate-600 ring-slate-500/15",
  default: "bg-[#edf7f1] text-[#075f3f] ring-emerald-600/10",
};

export function statusToBadgeTone(status: string): BadgeTone {
  const s = status.toLowerCase();
  if (s === "published" || s === "active") return "published";
  if (s === "draft") return "draft";
  if (s === "archived" || s === "inactive" || s === "suspended" || s === "disabled")
    return "archived";
  if (s === "new") return "new";
  if (s === "read") return "read";
  if (s === "replied") return "replied";
  return "default";
}

interface AdminBadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}

export default function AdminBadge({
  children,
  tone = "default",
  className,
}: AdminBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
