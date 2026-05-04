import { cloneDefaultSiteSettings } from "@/constants/default-site-settings";
import { SITE_SETTINGS_DOCUMENT_KEY } from "@/constants/site-settings";
import type { SiteSettingsDTO } from "@/types/site-settings";

/** Comma-separated keywords → trimmed non-empty strings (max 80). */
export function splitKeywordsFromCsv(csv: string): string[] {
  return csv
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)
    .slice(0, 80);
}

function normalizeKeywordArray(input: unknown): string[] {
  if (typeof input === "string") {
    return splitKeywordsFromCsv(input);
  }
  if (!Array.isArray(input)) return [];
  return input
    .filter((k): k is string => typeof k === "string" && k.trim().length > 0)
    .map((k) => k.trim().slice(0, 120));
}

const EMPTY_GLOBAL_CTA = {
  title: "",
  description: "",
  buttonText: "",
  buttonUrl: "",
  isActive: false,
} as const;

function normalizeGlobalCTA(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...EMPTY_GLOBAL_CTA };
  }
  const o = raw as Record<string, unknown>;
  return {
    title: typeof o.title === "string" ? o.title : "",
    description: typeof o.description === "string" ? o.description : "",
    buttonText: typeof o.buttonText === "string" ? o.buttonText : "",
    buttonUrl: typeof o.buttonUrl === "string" ? o.buttonUrl : "",
    isActive: Boolean(o.isActive),
  };
}

function normalizeSeo(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {
      metaTitle: "",
      metaDescription: "",
      keywords: [],
      canonicalUrl: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: undefined,
      robots: { index: true, follow: true },
      schemaType: "",
    };
  }
  const s = raw as Record<string, unknown>;
  const r =
    s.robots && typeof s.robots === "object" && !Array.isArray(s.robots)
      ? (s.robots as Record<string, unknown>)
      : {};

  return {
    metaTitle: typeof s.metaTitle === "string" ? s.metaTitle : "",
    metaDescription:
      typeof s.metaDescription === "string" ? s.metaDescription : "",
    keywords: normalizeKeywordArray(s.keywords),
    canonicalUrl: typeof s.canonicalUrl === "string" ? s.canonicalUrl : "",
    ogTitle: typeof s.ogTitle === "string" ? s.ogTitle : "",
    ogDescription:
      typeof s.ogDescription === "string" ? s.ogDescription : "",
    ogImage: s.ogImage,
    robots: {
      index: typeof r.index === "boolean" ? r.index : true,
      follow: typeof r.follow === "boolean" ? r.follow : true,
    },
    schemaType: typeof s.schemaType === "string" ? s.schemaType : "",
  };
}

function normalizePhoneRows(input: unknown): unknown[] {
  const arr = Array.isArray(input) ? input : [];
  return arr.filter((p) => {
    if (!p || typeof p !== "object") return false;
    const v = (p as { value?: string }).value;
    return typeof v === "string" && v.trim().length > 0;
  });
}

function normalizeEmailRows(input: unknown): unknown[] {
  const arr = Array.isArray(input) ? input : [];
  return arr.filter((e) => {
    if (!e || typeof e !== "object") return false;
    const v = (e as { value?: string }).value;
    return typeof v === "string" && v.trim().length > 0;
  });
}

function normalizeSocialRows(input: unknown): unknown[] {
  const arr = Array.isArray(input) ? input : [];
  const out: unknown[] = [];
  arr.forEach((row, i) => {
    if (!row || typeof row !== "object") return;
    const o = row as Record<string, unknown>;
    const platform = String(o.platform ?? "").trim();
    const url = String(o.url ?? "").trim();
    if (!platform || !url) return;
    const orderRaw = o.order;
    let order = i;
    if (typeof orderRaw === "number" && Number.isFinite(orderRaw)) order = orderRaw;
    else if (orderRaw !== undefined && orderRaw !== null && orderRaw !== "") {
      const n = Number(orderRaw);
      if (Number.isFinite(n)) order = n;
    }
    out.push({
      platform,
      url,
      icon: typeof o.icon === "string" ? o.icon.trim() : undefined,
      isActive: o.isActive === false ? false : true,
      order,
    });
  });
  return out;
}

/**
 * Structural normalization after merge (API) or before validation (client).
 * Ensures nested objects/arrays are never `undefined` at Zod boundaries (Zod 4 safe).
 */
export function normalizeSiteSettingsPatchInput(
  merged: Record<string, unknown>
): Record<string, unknown> {
  const def = cloneDefaultSiteSettings();

  const siteNameRaw = merged.siteName;
  const siteName =
    typeof siteNameRaw === "string" && siteNameRaw.trim().length > 0
      ? siteNameRaw.trim()
      : def.siteName;

  return {
    ...merged,
    key: SITE_SETTINGS_DOCUMENT_KEY,
    siteName,
    phones: normalizePhoneRows(merged.phones),
    emails: normalizeEmailRows(merged.emails),
    socialLinks: normalizeSocialRows(merged.socialLinks),
    globalCTA: normalizeGlobalCTA(merged.globalCTA),
    seo: normalizeSeo(merged.seo),
  };
}

/** Client: same normalization as PATCH after building form draft + keywords CSV. */
export function shapeSiteSettingsClientPayload(
  draft: SiteSettingsDTO,
  keywordsCsv: string
): Record<string, unknown> {
  const withKeywords: Record<string, unknown> = {
    ...draft,
    seo: {
      ...draft.seo,
      keywords: splitKeywordsFromCsv(keywordsCsv),
    },
  };
  return normalizeSiteSettingsPatchInput(withKeywords);
}
