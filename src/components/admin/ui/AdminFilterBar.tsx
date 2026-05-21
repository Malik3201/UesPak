import { cn } from "@/lib/utils";
import { adminCard } from "@/components/admin/ui/admin-theme";

interface AdminFilterBarProps {
  children: React.ReactNode;
  className?: string;
}

export default function AdminFilterBar({ children, className }: AdminFilterBarProps) {
  return (
    <div className={cn(adminCard, "flex flex-wrap items-end gap-4 p-4", className)}>
      {children}
    </div>
  );
}
