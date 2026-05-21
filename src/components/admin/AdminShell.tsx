import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import type { SafeAdmin } from "@/types/admin";

interface AdminShellProps {
  children: React.ReactNode;
  admin: SafeAdmin;
}

export default function AdminShell({ children, admin }: AdminShellProps) {
  return (
    <div className="admin-shell flex h-screen overflow-hidden bg-[#f4f7f5]">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminHeader admin={admin} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
