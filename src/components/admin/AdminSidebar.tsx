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

type NavItem = { href: string; label: string; icon: LucideIcon };

const mainNav: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/enquiries", label: "Enquiries", icon: Mail },
  { href: "/admin/settings", label: "Site Settings", icon: Settings },
  { href: "/admin/seo", label: "SEO Manager", icon: Search },
];

const contentNav: NavItem[] = [
  { href: "/admin/home", label: "Home Page", icon: Home },
  { href: "/admin/pages/about", label: "About Page", icon: FileText },
  { href: "/admin/pages/careers", label: "Careers Page", icon: FileText },
  { href: "/admin/pages/contact", label: "Contact Page", icon: FileText },
  { href: "/admin/pages/services", label: "Services Page", icon: FileText },
  { href: "/admin/pages/projects", label: "Projects Page", icon: FileText },
];

const catalogNav: NavItem[] = [
  { href: "/admin/services", label: "Services", icon: Briefcase },
  { href: "/admin/project-categories", label: "Project Categories", icon: FolderTree },
  { href: "/admin/projects", label: "Projects", icon: FolderOpen },
  { href: "/admin/team", label: "Team Members", icon: Users },
  { href: "/admin/jobs", label: "Jobs", icon: ClipboardList },
];

const systemNav: NavItem[] = [
  { href: "/admin/media", label: "Media Library", icon: Image },
  { href: "/admin/redirects", label: "Redirects", icon: ArrowLeftRight },
  { href: "/admin/users", label: "Admin Users", icon: Shield },
];

function NavGroup({ title, items, pathname }: { title: string; items: NavItem[]; pathname: string }) {
  return (
    <div className="mb-4">
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
        {title}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const active =
            item.href === "/admin/dashboard"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-[#075f3f] text-white shadow-md shadow-[#075f3f]/20"
                    : "text-slate-600 hover:bg-[#edf7f1] hover:text-[#075f3f]"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-full w-[260px] shrink-0 flex-col border-r border-emerald-900/8 bg-white lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-emerald-900/6 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#075f3f] text-sm font-bold text-white">
          U
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight text-[#075f3f]">UESPAK</p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Admin CMS</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin">
        <NavGroup title="Overview" items={mainNav} pathname={pathname} />
        <NavGroup title="Pages" items={contentNav} pathname={pathname} />
        <NavGroup title="Catalog" items={catalogNav} pathname={pathname} />
        <NavGroup title="System" items={systemNav} pathname={pathname} />
      </nav>

      <div className="border-t border-emerald-900/6 px-5 py-4 text-[10px] text-slate-400">
        © {new Date().getFullYear()} UESPAK Engineering
      </div>
    </aside>
  );
}
