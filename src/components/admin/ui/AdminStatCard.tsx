import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminCard } from "@/components/admin/ui/admin-theme";

interface AdminStatCardProps {
  title: string;
  value: number | string;
  subtext?: string;
  icon: LucideIcon;
  href?: string;
  accent?: "green" | "blue" | "amber" | "slate";
}

const accentMap = {
  green: "bg-[#075f3f]/10 text-[#075f3f]",
  blue: "bg-sky-100 text-sky-700",
  amber: "bg-amber-100 text-amber-800",
  slate: "bg-slate-100 text-slate-700",
};

export default function AdminStatCard({
  title,
  value,
  subtext,
  icon: Icon,
  href,
  accent = "green",
}: AdminStatCardProps) {
  const inner = (
    <div
      className={cn(
        adminCard,
        "group p-5 transition-all duration-200",
        href && "hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(7,95,63,0.12)]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            accentMap[accent]
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </p>
      <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">{value}</p>
      {subtext ? <p className="mt-1 text-xs text-slate-500">{subtext}</p> : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075f3f] rounded-2xl">
        {inner}
      </Link>
    );
  }
  return inner;
}
