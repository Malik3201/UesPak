import { cn } from "@/lib/utils";
import { adminCard } from "@/components/admin/ui/admin-theme";

interface AdminSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export default function AdminSection({
  title,
  description,
  children,
  className,
  action,
}: AdminSectionProps) {
  return (
    <section className={cn(adminCard, "overflow-hidden", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-emerald-900/6 bg-[#fafcfb] px-6 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="space-y-4 p-6">{children}</div>
    </section>
  );
}
