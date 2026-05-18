import type { MetadataRoute } from "next";
import { getSeoSettings, resolveSiteBaseUrl } from "@/lib/seo-settings";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSeoSettings();
  const base = resolveSiteBaseUrl(settings);

  if (!settings.robotsTxtEnabled) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  const disallow = ["/admin/", "/api/", "/_next/"];
  for (const path of settings.noIndexPaths || []) {
    const rule = path.trim();
    if (rule && !disallow.includes(rule)) disallow.push(rule);
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow,
    },
    ...(settings.sitemapEnabled ? { sitemap: `${base}/sitemap.xml` } : {}),
  };
}
