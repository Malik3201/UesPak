import { cn } from "@/lib/utils";
import AdminEmptyState from "@/components/admin/ui/AdminEmptyState";
import { adminTableHead, adminTableRow, adminTableWrap } from "@/components/admin/ui/admin-theme";
import type { LucideIcon } from "lucide-react";

interface AdminTableProps {
  children: React.ReactNode;
  minWidth?: string;
  className?: string;
}

export function AdminTable({ children, minWidth = "720px", className }: AdminTableProps) {
  return (
    <div className={cn(adminTableWrap, className)}>
      <table className="w-full text-sm" style={{ minWidth }}>
        {children}
      </table>
    </div>
  );
}

export function AdminTableHead({ children }: { children: React.ReactNode }) {
  return <thead className={adminTableHead}>{children}</thead>;
}

export function AdminTableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function AdminTableRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <tr className={cn(adminTableRow, className)}>{children}</tr>;
}

export function AdminTableTh({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={cn("px-4 py-3.5 font-semibold", className)} scope="col">
      {children}
    </th>
  );
}

export function AdminTableTd({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={cn("px-4 py-3.5 align-middle text-slate-700", className)}>{children}</td>;
}

interface AdminTableEmptyProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  colSpan: number;
}

export function AdminTableEmpty({
  title,
  description,
  icon,
  colSpan,
}: AdminTableEmptyProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="p-0">
        <AdminEmptyState title={title} description={description} icon={icon} className="border-0 rounded-none" />
      </td>
    </tr>
  );
}
