import { cn } from "@/lib/utils";

type AlertVariant = "success" | "error" | "info" | "warning";

const variants: Record<AlertVariant, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-sky-200 bg-sky-50 text-sky-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
};

interface AdminAlertProps {
  children: React.ReactNode;
  variant?: AlertVariant;
  className?: string;
}

export default function AdminAlert({
  children,
  variant = "info",
  className,
}: AdminAlertProps) {
  return (
    <p
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        variants[variant],
        className
      )}
      role="alert"
    >
      {children}
    </p>
  );
}
