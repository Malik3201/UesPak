import { SITE_SETTINGS_DOCUMENT_KEY } from "@/constants/site-settings";
import type { SiteSettingsDTO } from "@/types/site-settings";

function hasKey(obj: Record<string, unknown>, k: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, k);
}

/**
 * Merge a PATCH body into the existing document snapshot so omitted JSON keys
 * (stripped by `JSON.stringify`) do not wipe unchanged fields when partial payloads are sent.
 */
export function mergeSiteSettingsPatchPayload(
  existing: SiteSettingsDTO,
  body: Record<string, unknown>
): Record<string, unknown> {
  const h = (k: string) => hasKey(body, k);

  const mergedGlobal =
    h("globalCTA") &&
    typeof body.globalCTA === "object" &&
    body.globalCTA !== null &&
    !Array.isArray(body.globalCTA)
      ? {
          ...(existing.globalCTA ?? { isActive: false }),
          ...(body.globalCTA as Record<string, unknown>),
        }
      : existing.globalCTA;

  const mergedSeo =
    h("seo") &&
    typeof body.seo === "object" &&
    body.seo !== null &&
    !Array.isArray(body.seo)
      ? (() => {
          const eb = body.seo as Record<string, unknown>;
          const next = {
            ...existing.seo,
            ...eb,
          };
          const er = eb.robots;
          if (
            typeof er === "object" &&
            er !== null &&
            !Array.isArray(er)
          ) {
            const rr = er as Record<string, unknown>;
            next.robots = {
              index:
                typeof rr.index === "boolean"
                  ? rr.index
                  : (existing.seo.robots?.index !== false),
              follow:
                typeof rr.follow === "boolean"
                  ? rr.follow
                  : (existing.seo.robots?.follow !== false),
            };
          }
          if (!Array.isArray(next.keywords))
            next.keywords = existing.seo.keywords ?? [];
          return next;
        })()
      : existing.seo;

  return {
    key: SITE_SETTINGS_DOCUMENT_KEY,
    siteName: h("siteName") ? body.siteName : existing.siteName,
    tagline: h("tagline") ? body.tagline : existing.tagline,
    logo: h("logo") ? body.logo : existing.logo,
    darkLogo: h("darkLogo") ? body.darkLogo : existing.darkLogo,
    favicon: h("favicon") ? body.favicon : existing.favicon,
    phones: h("phones") ? body.phones : existing.phones,
    emails: h("emails") ? body.emails : existing.emails,
    address: h("address") ? body.address : existing.address,
    workingHours: h("workingHours") ? body.workingHours : existing.workingHours,
    mapEmbedUrl: h("mapEmbedUrl") ? body.mapEmbedUrl : existing.mapEmbedUrl,
    socialLinks: h("socialLinks") ? body.socialLinks : existing.socialLinks,
    profilePdf: h("profilePdf") ? body.profilePdf : existing.profilePdf,
    profileButtonText: h("profileButtonText")
      ? body.profileButtonText
      : existing.profileButtonText,
    footerText: h("footerText") ? body.footerText : existing.footerText,
    copyrightText: h("copyrightText") ? body.copyrightText : existing.copyrightText,
    footerDescription: h("footerDescription")
      ? body.footerDescription
      : existing.footerDescription,
    globalCTA: mergedGlobal ?? { isActive: false },
    seo: mergedSeo ?? {
      keywords: [],
      robots: { index: true, follow: true },
    },
  };
}
