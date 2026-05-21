import { cn } from "@/lib/utils";
import { adminCard } from "@/components/admin/ui/admin-theme";

interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function AdminCard({
  children,
  className,
  padding = "md",
}: AdminCardProps) {
  return (
    <div className={cn(adminCard, paddingMap[padding], className)}>{children}</div>
  );
}
