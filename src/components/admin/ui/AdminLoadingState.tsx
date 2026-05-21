import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLoadingStateProps {
  label?: string;
  className?: string;
}

export default function AdminLoadingState({
  label = "Loading…",
  className,
}: AdminLoadingStateProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3 rounded-2xl border border-emerald-900/8 bg-white py-16 text-sm text-slate-600",
        className
      )}
    >
      <Loader2 className="h-5 w-5 animate-spin text-[#075f3f]" aria-hidden />
      {label}
    </div>
  );
}
