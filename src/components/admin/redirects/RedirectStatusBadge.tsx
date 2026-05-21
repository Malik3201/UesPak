import { cn } from "@/lib/utils";

interface RedirectStatusBadgeProps {
  isActive: boolean;
}

export default function RedirectStatusBadge({ isActive }: RedirectStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
        isActive
          ? "bg-emerald-100 text-emerald-800"
          : "bg-slate-100 text-slate-600"
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}
