"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Briefcase,
  FolderOpen,
  Users,
  Mail,
  Settings,
  Image,
  ArrowLeftRight,
} from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/services", label: "Services", icon: Briefcase },
  { href: "/admin/projects", label: "Projects", icon: FolderOpen },
  { href: "/admin/team", label: "Team", icon: Users },
  { href: "/admin/enquiries", label: "Enquiries", icon: Mail },
  { href: "/admin/media", label: "Media", icon: Image },
  { href: "/admin/redirects", label: "Redirects", icon: ArrowLeftRight },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-6">
        <span className="text-lg font-bold tracking-tight text-primary">
          UESPAK <span className="text-xs font-normal text-muted-foreground">Admin</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5 list-none p-0 m-0">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/admin/dashboard"
                ? pathname === href
                : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/70 hover:bg-accent hover:text-foreground"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
        © {new Date().getFullYear()} UESPAK
      </div>
    </aside>
  );
}
