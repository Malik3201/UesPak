import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminEmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export default function AdminEmptyState({
  title,
  description,
  icon: Icon,
  action,
  className,
}: AdminEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-900/15 bg-[#f8faf9] px-6 py-14 text-center",
        className
      )}
    >
      {Icon ? (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#075f3f]/10 text-[#075f3f]">
          <Icon className="h-7 w-7" aria-hidden />
        </div>
      ) : null}
      <p className="text-base font-semibold text-slate-800">{title}</p>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-slate-600">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
