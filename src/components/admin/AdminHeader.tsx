"use client";

import { LogOut, Bell } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminHeader() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div />

      <div className="flex items-center gap-3">
        <button
          className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Log out"
          id="admin-logout-btn"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Logout
        </button>
      </div>
    </header>
  );
}
