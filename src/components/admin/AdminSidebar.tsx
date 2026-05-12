"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  Home,
  FileText,
  Briefcase,
  FolderTree,
  FolderOpen,
  Users,
  ClipboardList,
  Mail,
  Image,
  Search,
  ArrowLeftRight,
  Shield,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem =
  | { kind: "link"; href: string; label: string; icon: LucideIcon }
  | { kind: "placeholder"; label: string; icon: LucideIcon };

const navItems: NavItem[] = [
  { kind: "link", href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    kind: "link",
    href: "/admin/settings",
    label: "Site Settings",
    icon: Settings,
  },
  { kind: "link", href: "/admin/home", label: "Home Page", icon: Home },
  { kind: "link", href: "/admin/pages/about", label: "About Page", icon: FileText },
  { kind: "link", href: "/admin/pages/careers", label: "Careers Page", icon: FileText },
  { kind: "link", href: "/admin/pages/contact", label: "Contact Page", icon: FileText },
  { kind: "link", href: "/admin/services", label: "Services", icon: Briefcase },
  { kind: "link", href: "/admin/project-categories", label: "Project Categories", icon: FolderTree },
  { kind: "link", href: "/admin/projects", label: "Projects", icon: FolderOpen },
  { kind: "link", href: "/admin/team", label: "Team Members", icon: Users },
  { kind: "placeholder", label: "Jobs", icon: ClipboardList },
  { kind: "link", href: "/admin/enquiries", label: "Enquiries", icon: Mail },
  { kind: "link", href: "/admin/media", label: "Media Library", icon: Image },
  { kind: "placeholder", label: "SEO Manager", icon: Search },
  { kind: "placeholder", label: "Redirects", icon: ArrowLeftRight },
  { kind: "placeholder", label: "Admin Users", icon: Shield },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center border-b border-border px-6">
        <span className="text-lg font-bold tracking-tight text-primary">
          UESPAK{" "}
          <span className="text-xs font-normal text-muted-foreground">Admin</span>
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin">
        <ul className="m-0 list-none space-y-0.5 p-0">
          {navItems.map((item) => {
            if (item.kind === "link") {
              const active =
                item.href === "/admin/dashboard"
                  ? pathname === item.href
                  : pathname.startsWith(item.href + "/") ||
                    pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground/70 hover:bg-accent hover:text-foreground"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              );
            }

            const Icon = item.icon;
            return (
              <li key={item.label}>
                <span
                  className="flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground/60"
                  title="Coming in a future release"
                  aria-disabled="true"
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-60" aria-hidden="true" />
                  {item.label}
                </span>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
        © {new Date().getFullYear()} UESPAK
      </div>
    </aside>
  );
}
