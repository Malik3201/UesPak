"use client";

import Link from "next/link";
import { ExternalLink, LogOut, Menu } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import type { SafeAdmin } from "@/types/admin";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import { ADMIN_ROLE_LABELS } from "@/types/admin-user";

const PAGE_TITLES: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/settings": "Site Settings",
  "/admin/home": "Home Page",
  "/admin/services": "Services",
  "/admin/projects": "Projects",
  "/admin/team": "Team Members",
  "/admin/jobs": "Jobs",
  "/admin/enquiries": "Enquiries",
  "/admin/media": "Media Library",
  "/admin/seo": "SEO Manager",
  "/admin/redirects": "Redirects",
  "/admin/users": "Admin Users",
};

function resolveTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/admin/pages/")) return "Page Content";
  if (pathname.startsWith("/admin/project-categories")) return "Project Categories";
  if (pathname.includes("/new")) return "Create";
  if (pathname.match(/\/admin\/[^/]+\/[^/]+$/)) return "Edit";
  return "Admin";
}

interface AdminHeaderProps {
  admin: SafeAdmin;
}

export default function AdminHeader({ admin }: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNav, setMobileNav] = useState(false);
  const title = resolveTitle(pathname);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "/";

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-emerald-900/8 bg-white/95 px-4 shadow-sm backdrop-blur md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 hover:bg-[#edf7f1] lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobileNav((v) => !v)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
            <p className="hidden truncate text-xs text-slate-500 sm:block">UESPAK Content Management</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-lg border border-emerald-900/10 px-3 py-1.5 text-xs font-semibold text-[#075f3f] transition hover:bg-[#edf7f1] sm:inline-flex"
          >
            View Site
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
          <div className="hidden text-right md:block">
            <p className="text-sm font-medium text-slate-900">{admin.name}</p>
            <p className="text-[10px] text-slate-500">{admin.email}</p>
          </div>
          <AdminBadge tone="default">
            {ADMIN_ROLE_LABELS[admin.role as keyof typeof ADMIN_ROLE_LABELS] || admin.role}
          </AdminBadge>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-[#edf7f1] hover:text-[#075f3f]"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {mobileNav ? (
        <div className="border-b border-emerald-900/8 bg-white px-4 py-3 lg:hidden">
          <Link
            href="/admin/dashboard"
            className="block py-2 text-sm font-medium text-slate-700"
            onClick={() => setMobileNav(false)}
          >
            Dashboard
          </Link>
          <p className="py-2 text-xs text-slate-500">
            Use a wider screen for full navigation, or scroll the sidebar on tablet.
          </p>
        </div>
      ) : null}
    </>
  );
}
