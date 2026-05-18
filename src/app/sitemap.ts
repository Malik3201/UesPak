import type { MetadataRoute } from "next";
import { getAllServiceSlugs } from "@/lib/services";
import { getAllProjectSlugs } from "@/lib/projects";
import { getPublishedJobSlugs } from "@/lib/jobs";
import { getSeoSettings, resolveSiteBaseUrl } from "@/lib/seo-settings";
import { PROJECT_GROUPS } from "@/types/project";
import { SERVICE_GROUPS } from "@/types/service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSeoSettings();
  if (!settings.sitemapEnabled) return [];

  const base = resolveSiteBaseUrl(settings);
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about-us`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/services`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/careers`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/contact-us`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];

  const serviceGroupPages: MetadataRoute.Sitemap = SERVICE_GROUPS.map((g) => ({
    url: `${base}/services/group/${g.value}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const projectGroupPages: MetadataRoute.Sitemap = PROJECT_GROUPS.map((g) => ({
    url: `${base}/projects/group/${g.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  let serviceSlugs: string[] = [];
  let projectSlugs: string[] = [];
  let jobSlugs: string[] = [];

  try {
    [serviceSlugs, projectSlugs, jobSlugs] = await Promise.all([
      getAllServiceSlugs(),
      getAllProjectSlugs(),
      getPublishedJobSlugs(),
    ]);
  } catch {
    // Graceful fallback — static pages only
  }

  const servicePages: MetadataRoute.Sitemap = serviceSlugs.map((slug) => ({
    url: `${base}/services/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const projectPages: MetadataRoute.Sitemap = projectSlugs.map((slug) => ({
    url: `${base}/projects/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const jobPages: MetadataRoute.Sitemap = jobSlugs.map((slug) => ({
    url: `${base}/careers/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  return [
    ...staticPages,
    ...serviceGroupPages,
    ...projectGroupPages,
    ...servicePages,
    ...projectPages,
    ...jobPages,
  ];
}
