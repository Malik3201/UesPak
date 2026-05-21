import Link from "next/link";
import {
  ArrowLeftRight,
  Briefcase,
  ClipboardList,
  ExternalLink,
  FolderOpen,
  Mail,
  Plus,
  Search,
  Settings,
  Users,
} from "lucide-react";
import AdminStatCard from "@/components/admin/ui/AdminStatCard";
import AdminCard from "@/components/admin/ui/AdminCard";
import AdminBadge, { statusToBadgeTone } from "@/components/admin/ui/AdminBadge";
import AdminBarChart from "@/components/admin/ui/AdminBarChart";
import AdminStatusChart from "@/components/admin/ui/AdminStatusChart";
import AdminEmptyState from "@/components/admin/ui/AdminEmptyState";
import type { DashboardData } from "@/lib/dashboard";
import type { SafeAdmin } from "@/types/admin";
import { ADMIN_ROLE_LABELS } from "@/types/admin-user";

interface AdminDashboardProps {
  admin: SafeAdmin;
  data: DashboardData;
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminDashboard({ admin, data }: AdminDashboardProps) {
  const { counts, contentStatus, enquiryTrend, launchReadiness } = data;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "/";

  const trendChart = enquiryTrend.slice(-7).map((d) => ({
    label: d.date,
    value: d.count,
  }));

  const contentSegments = [
    { label: "Published", value: contentStatus.services.published + contentStatus.projects.published + contentStatus.jobs.published, color: "#075f3f" },
    { label: "Draft", value: contentStatus.services.draft + contentStatus.projects.draft + contentStatus.jobs.draft, color: "#d97706" },
    { label: "Archived", value: contentStatus.services.archived + contentStatus.projects.archived + contentStatus.jobs.archived, color: "#94a3b8" },
  ];

  const quickActions = [
    { href: "/admin/services/new", label: "Add Service", icon: Plus },
    { href: "/admin/projects/new", label: "Add Project", icon: Plus },
    { href: "/admin/jobs/new", label: "Add Job", icon: Plus },
    { href: "/admin/enquiries", label: "View Enquiries", icon: Mail },
    { href: "/admin/seo", label: "SEO Manager", icon: Search },
    { href: "/admin/settings", label: "Site Settings", icon: Settings },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-emerald-900/8 bg-gradient-to-br from-[#075f3f] via-[#064a32] to-[#052f21] p-6 text-white shadow-[0_16px_48px_rgba(7,95,63,0.25)] md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100/90">
              UESPAK CMS
            </p>
            <h1 className="mt-2 text-2xl font-bold md:text-3xl">
              Welcome back, {admin.name.split(" ")[0] || admin.name}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-emerald-50/85">
              Manage UESPAK content, enquiries, SEO and public pages from one place.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <AdminBadge tone="default" className="bg-white/15 text-white ring-white/20">
                {ADMIN_ROLE_LABELS[admin.role as keyof typeof ADMIN_ROLE_LABELS] || admin.role}
              </AdminBadge>
              <span className="text-xs text-emerald-100/80">{admin.email}</span>
            </div>
          </div>
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#075f3f] shadow-lg transition hover:bg-emerald-50"
          >
            View Website
            <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        <AdminStatCard
          title="Services"
          value={counts.servicesTotal}
          subtext={`${counts.servicesPublished} published`}
          icon={Briefcase}
          href="/admin/services"
        />
        <AdminStatCard
          title="Projects"
          value={counts.projectsTotal}
          subtext={`${counts.projectsPublished} published`}
          icon={FolderOpen}
          href="/admin/projects"
          accent="blue"
        />
        <AdminStatCard
          title="Team"
          value={counts.teamMembersTotal}
          subtext="Published on site"
          icon={Users}
          href="/admin/team"
        />
        <AdminStatCard
          title="Enquiries"
          value={counts.enquiriesTotal}
          subtext={`${counts.enquiriesNew} new`}
          icon={Mail}
          href="/admin/enquiries"
          accent={counts.enquiriesNew > 0 ? "amber" : "green"}
        />
        <AdminStatCard
          title="Jobs"
          value={counts.jobsTotal}
          subtext={`${counts.jobsPublished} open positions`}
          icon={ClipboardList}
          href="/admin/jobs"
        />
        <AdminStatCard
          title="Redirects"
          value={counts.redirectsTotal}
          subtext="URL mappings"
          icon={ArrowLeftRight}
          href="/admin/redirects"
          accent="slate"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AdminCard>
          <h2 className="text-base font-semibold text-slate-900">Enquiries — last 7 days</h2>
          <p className="mt-1 text-xs text-slate-500">Daily submission volume</p>
          <div className="mt-4">
            <AdminBarChart data={trendChart} emptyLabel="No enquiries in the last week" />
          </div>
        </AdminCard>

        <AdminCard>
          <h2 className="text-base font-semibold text-slate-900">Content status</h2>
          <p className="mt-1 text-xs text-slate-500">Services, projects & jobs combined</p>
          <div className="mt-4">
            <AdminStatusChart segments={contentSegments} />
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs">
            <div className="rounded-xl bg-[#f4f9f6] p-3">
              <p className="font-bold text-slate-900">{counts.servicesTotal}</p>
              <p className="text-slate-500">Services</p>
            </div>
            <div className="rounded-xl bg-[#f4f9f6] p-3">
              <p className="font-bold text-slate-900">{counts.projectsTotal}</p>
              <p className="text-slate-500">Projects</p>
            </div>
            <div className="rounded-xl bg-[#f4f9f6] p-3">
              <p className="font-bold text-slate-900">{counts.jobsTotal}</p>
              <p className="text-slate-500">Jobs</p>
            </div>
          </div>
        </AdminCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AdminCard>
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-900">Recent enquiries</h2>
            <Link
              href="/admin/enquiries"
              className="text-sm font-semibold text-[#075f3f] hover:underline"
            >
              View all
            </Link>
          </div>
          {data.recentEnquiries.length ? (
            <ul className="divide-y divide-emerald-900/6">
              {data.recentEnquiries.map((e) => (
                <li key={e.id} className="flex flex-wrap items-start justify-between gap-2 py-3 first:pt-0">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{e.name}</p>
                    <p className="truncate text-xs text-slate-500">{e.email}</p>
                    <p className="mt-0.5 text-sm text-slate-700">{e.subject}</p>
                  </div>
                  <div className="text-right">
                    <AdminBadge tone={statusToBadgeTone(e.status)}>{e.status}</AdminBadge>
                    <p className="mt-1 text-[10px] text-slate-400">{formatDate(e.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <AdminEmptyState title="No enquiries yet" description="Submissions from the contact form will appear here." />
          )}
        </AdminCard>

        <AdminCard>
          <h2 className="mb-4 text-base font-semibold text-slate-900">Recent content</h2>
          <div className="space-y-4">
            {[
              ...data.recentServices,
              ...data.recentProjects,
              ...data.recentJobs,
            ]
              .sort(
                (a, b) =>
                  new Date(b.updatedAt || 0).getTime() -
                  new Date(a.updatedAt || 0).getTime()
              )
              .slice(0, 6)
              .map((item) => {
                const editHref =
                  item.type === "service"
                    ? `/admin/services/${item.id}`
                    : item.type === "project"
                      ? `/admin/projects/${item.id}`
                      : `/admin/jobs/${item.id}`;
                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-emerald-900/6 bg-[#fafcfb] px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{item.title}</p>
                      <p className="text-[10px] uppercase tracking-wide text-slate-500">
                        {item.type}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <AdminBadge tone={statusToBadgeTone(item.status)}>{item.status}</AdminBadge>
                      <Link
                        href={editHref}
                        className="text-xs font-semibold text-[#075f3f] hover:underline"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                );
              })}
            {!data.recentServices.length &&
            !data.recentProjects.length &&
            !data.recentJobs.length ? (
              <AdminEmptyState title="No content yet" description="Create services, projects or jobs to see activity here." />
            ) : null}
          </div>
        </AdminCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <AdminCard className="lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Quick actions</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-2 rounded-xl border border-emerald-900/8 bg-[#f8faf9] px-4 py-3 text-sm font-semibold text-[#075f3f] transition hover:border-[#075f3f]/25 hover:bg-[#edf7f1]"
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  {action.label}
                </Link>
              );
            })}
          </div>
        </AdminCard>

        <AdminCard>
          <h2 className="mb-4 text-base font-semibold text-slate-900">Launch readiness</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between gap-2">
              <span className="text-slate-600">Site settings</span>
              <AdminBadge tone={launchReadiness.siteSettingsConfigured ? "published" : "draft"}>
                {launchReadiness.siteSettingsConfigured ? "OK" : "Review"}
              </AdminBadge>
            </li>
            <li className="flex items-center justify-between gap-2">
              <span className="text-slate-600">SEO manager</span>
              <AdminBadge tone={launchReadiness.seoConfigured ? "published" : "draft"}>
                {launchReadiness.seoConfigured ? "OK" : "Review"}
              </AdminBadge>
            </li>
            <li className="flex items-center justify-between gap-2">
              <span className="text-slate-600">Email notifications</span>
              <AdminBadge tone={launchReadiness.emailConfigured ? "published" : "draft"}>
                {launchReadiness.emailConfigured ? "Active" : "Check SMTP"}
              </AdminBadge>
            </li>
            <li className="flex items-center justify-between gap-2">
              <span className="text-slate-600">Sitemap</span>
              <AdminBadge tone={launchReadiness.sitemapEnabled ? "published" : "archived"}>
                {launchReadiness.sitemapEnabled ? "Enabled" : "Off"}
              </AdminBadge>
            </li>
          </ul>
          {launchReadiness.domainNote ? (
            <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
              {launchReadiness.domainNote}
            </p>
          ) : null}
        </AdminCard>
      </div>
    </div>
  );
}
