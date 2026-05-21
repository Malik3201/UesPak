import { connectDB } from "@/lib/db";
import { Service } from "@/models/Service";
import { Project } from "@/models/Project";
import { TeamMember } from "@/models/TeamMember";
import { Job } from "@/models/Job";
import { ContactSubmission } from "@/models/ContactSubmission";
import { Redirect } from "@/models/Redirect";
import { AdminUser } from "@/models/AdminUser";
import { MediaAsset } from "@/models/MediaAsset";
import { SeoSetting } from "@/models/SeoSetting";
import { SEO_SETTINGS_DOCUMENT_KEY } from "@/constants/seo-settings";
import { SiteSetting } from "@/models/SiteSetting";
import { SITE_SETTINGS_DOCUMENT_KEY } from "@/constants/site-settings";

export interface StatusBreakdown {
  published: number;
  draft: number;
  archived: number;
}

export interface DashboardCounts {
  servicesTotal: number;
  servicesPublished: number;
  projectsTotal: number;
  projectsPublished: number;
  teamMembersTotal: number;
  jobsTotal: number;
  jobsPublished: number;
  enquiriesTotal: number;
  enquiriesNew: number;
  redirectsTotal: number;
  adminUsersTotal: number;
  mediaTotal: number;
}

export interface DashboardEnquiryTrend {
  date: string;
  count: number;
}

export interface DashboardRecentEnquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  status: string;
  createdAt: string;
}

export interface DashboardRecentContent {
  id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt?: string;
  type: "service" | "project" | "job";
}

export interface DashboardData {
  counts: DashboardCounts;
  contentStatus: {
    services: StatusBreakdown;
    projects: StatusBreakdown;
    jobs: StatusBreakdown;
  };
  enquiryTrend: DashboardEnquiryTrend[];
  recentEnquiries: DashboardRecentEnquiry[];
  recentServices: DashboardRecentContent[];
  recentProjects: DashboardRecentContent[];
  recentJobs: DashboardRecentContent[];
  launchReadiness: {
    siteSettingsConfigured: boolean;
    seoConfigured: boolean;
    emailConfigured: boolean;
    sitemapEnabled: boolean;
    domainNote?: string;
  };
}

const EMPTY_COUNTS: DashboardCounts = {
  servicesTotal: 0,
  servicesPublished: 0,
  projectsTotal: 0,
  projectsPublished: 0,
  teamMembersTotal: 0,
  jobsTotal: 0,
  jobsPublished: 0,
  enquiriesTotal: 0,
  enquiriesNew: 0,
  redirectsTotal: 0,
  adminUsersTotal: 0,
  mediaTotal: 0,
};

const EMPTY_STATUS: StatusBreakdown = { published: 0, draft: 0, archived: 0 };

function statusBreakdown(
  docs: Array<{ status?: string }>
): StatusBreakdown {
  const out = { ...EMPTY_STATUS };
  for (const d of docs) {
    if (d.status === "published") out.published++;
    else if (d.status === "archived") out.archived++;
    else out.draft++;
  }
  return out;
}

function lastNDays(days: number): string[] {
  const keys: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    keys.push(d.toISOString().slice(0, 10));
  }
  return keys;
}

export async function getDashboardData(): Promise<DashboardData> {
  try {
    await connectDB();

    const [
      services,
      projects,
      teamCount,
      jobs,
      enquiriesTotal,
      enquiriesNew,
      redirectsTotal,
      adminUsersTotal,
      mediaTotal,
      recentEnquiryDocs,
      recentServices,
      recentProjects,
      recentJobs,
      trendDocs,
      seoDoc,
      siteDoc,
    ] = await Promise.all([
      Service.find().select("status title slug updatedAt").lean(),
      Project.find().select("status title slug updatedAt").lean(),
      TeamMember.countDocuments(),
      Job.find().select("status title slug updatedAt").lean(),
      ContactSubmission.countDocuments(),
      ContactSubmission.countDocuments({ status: "new" }),
      Redirect.countDocuments(),
      AdminUser.countDocuments(),
      MediaAsset.countDocuments().catch(() => 0),
      ContactSubmission.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email subject status createdAt")
        .lean(),
      Service.find()
        .sort({ updatedAt: -1 })
        .limit(4)
        .select("title slug status updatedAt")
        .lean(),
      Project.find()
        .sort({ updatedAt: -1 })
        .limit(4)
        .select("title slug status updatedAt")
        .lean(),
      Job.find()
        .sort({ updatedAt: -1 })
        .limit(4)
        .select("title slug status updatedAt")
        .lean(),
      ContactSubmission.find({
        createdAt: {
          $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        },
      })
        .select("createdAt")
        .lean(),
      SeoSetting.findOne({ key: SEO_SETTINGS_DOCUMENT_KEY }).lean(),
      SiteSetting.findOne({ key: SITE_SETTINGS_DOCUMENT_KEY }).lean(),
    ]);

    const servicesPublished = services.filter((s) => s.status === "published").length;
    const projectsPublished = projects.filter((p) => p.status === "published").length;
    const jobsPublished = jobs.filter((j) => j.status === "published").length;

    const dayKeys = lastNDays(14);
    const trendMap = new Map(dayKeys.map((d) => [d, 0]));
    for (const e of trendDocs) {
      if (!e.createdAt) continue;
      const key = new Date(e.createdAt).toISOString().slice(0, 10);
      if (trendMap.has(key)) trendMap.set(key, (trendMap.get(key) ?? 0) + 1);
    }
    const enquiryTrend = dayKeys.map((date) => ({
      date,
      count: trendMap.get(date) ?? 0,
    }));

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "";
    const domainNote =
      siteUrl.includes("vercel.app") || !siteUrl
        ? "Set your production domain in Site Settings / SEO Manager before launch."
        : undefined;

    return {
      counts: {
        servicesTotal: services.length,
        servicesPublished,
        projectsTotal: projects.length,
        projectsPublished,
        teamMembersTotal: teamCount,
        jobsTotal: jobs.length,
        jobsPublished,
        enquiriesTotal,
        enquiriesNew,
        redirectsTotal,
        adminUsersTotal,
        mediaTotal: typeof mediaTotal === "number" ? mediaTotal : 0,
      },
      contentStatus: {
        services: statusBreakdown(services),
        projects: statusBreakdown(projects),
        jobs: statusBreakdown(jobs),
      },
      enquiryTrend,
      recentEnquiries: recentEnquiryDocs.map((e) => ({
        id: String(e._id),
        name: e.name,
        email: e.email,
        subject: e.subject,
        status: e.status,
        createdAt: e.createdAt
          ? new Date(e.createdAt).toISOString()
          : new Date().toISOString(),
      })),
      recentServices: recentServices.map((s) => ({
        id: String(s._id),
        title: s.title,
        slug: s.slug,
        status: s.status,
        updatedAt: s.updatedAt ? new Date(s.updatedAt).toISOString() : undefined,
        type: "service" as const,
      })),
      recentProjects: recentProjects.map((p) => ({
        id: String(p._id),
        title: p.title,
        slug: p.slug,
        status: p.status,
        updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : undefined,
        type: "project" as const,
      })),
      recentJobs: recentJobs.map((j) => ({
        id: String(j._id),
        title: j.title,
        slug: j.slug,
        status: j.status,
        updatedAt: j.updatedAt ? new Date(j.updatedAt).toISOString() : undefined,
        type: "job" as const,
      })),
      launchReadiness: {
        siteSettingsConfigured: Boolean(siteDoc),
        seoConfigured: Boolean(seoDoc?.defaultMetaTitle || seoDoc?.siteUrl),
        emailConfigured: Boolean(
          process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
        ),
        sitemapEnabled: seoDoc?.sitemapEnabled !== false,
        domainNote,
      },
    };
  } catch {
    return {
      counts: { ...EMPTY_COUNTS },
      contentStatus: {
        services: { ...EMPTY_STATUS },
        projects: { ...EMPTY_STATUS },
        jobs: { ...EMPTY_STATUS },
      },
      enquiryTrend: lastNDays(14).map((date) => ({ date, count: 0 })),
      recentEnquiries: [],
      recentServices: [],
      recentProjects: [],
      recentJobs: [],
      launchReadiness: {
        siteSettingsConfigured: false,
        seoConfigured: false,
        emailConfigured: false,
        sitemapEnabled: true,
        domainNote: "Database unavailable — counts may be incomplete.",
      },
    };
  }
}
