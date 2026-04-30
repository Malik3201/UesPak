import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Static sitemap — Phase 2 will add dynamic services/projects from MongoDB.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/about-us", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/services", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/projects", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/careers", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/contact-us", priority: 0.8, changeFrequency: "monthly" as const },
  ];

  return staticPages.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
