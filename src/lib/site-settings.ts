import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { SITE_SETTINGS_DOCUMENT_KEY } from "@/constants/site-settings";
import {
  SiteSetting,
  siteSettingToDTO,
} from "@/models/SiteSetting";
import type {
  PublicSiteSettings,
  SiteSettingsDTO,
  SiteSettingsSocialLink,
} from "@/types/site-settings";
import { cloneDefaultSiteSettings } from "@/constants/default-site-settings";

const LEGACY_KEY_GLOBAL = "global";

/** Canonical defaults before any Mongo document exists. */
export function getDefaultSiteSettings(): SiteSettingsDTO {
  return cloneDefaultSiteSettings();
}

/** Primary contact from labelled list — prefers `isPrimary`, else first entry. */
function pickPrimary<T extends { value: string; isPrimary?: boolean }>(
  rows: T[]
): string | undefined {
  if (!rows?.length) return undefined;
  const primary = rows.find((r) => r.isPrimary) ?? rows[0];
  const v = primary?.value?.trim();
  return v || undefined;
}

function coerceLegacySocials(dto: SiteSettingsDTO, rawDoc: Record<string, unknown>): void {
  if (dto.socialLinks.length === 0) {
    const add = (
      platform: string,
      url: string | undefined,
      order: number
    ) => {
      const u = url?.trim();
      if (!u) return;
      dto.socialLinks.push({
        platform,
        url: u,
        icon: undefined,
        isActive: true,
        order,
      });
    };
    add("LinkedIn", rawDoc.linkedIn as string | undefined, 0);
    add("Twitter", rawDoc.twitter as string | undefined, 1);
    add("Facebook", rawDoc.facebook as string | undefined, 2);
    add("Instagram", rawDoc.instagram as string | undefined, 3);
  }

  if (!dto.phones.length && typeof rawDoc.phone === "string" && rawDoc.phone.trim()) {
    dto.phones.push({ value: rawDoc.phone.trim(), isPrimary: true });
  }
  if (!dto.emails.length && typeof rawDoc.email === "string" && rawDoc.email.includes("@")) {
    dto.emails.push({ value: rawDoc.email.trim(), isPrimary: true });
  }
}

function mergeLegacySeo(dto: SiteSettingsDTO, rawDoc: Record<string, unknown>): void {
  const legacy = rawDoc.defaultSeo;
  if (!legacy || typeof legacy !== "object") return;
  const ls = legacy as Record<string, unknown>;
  dto.seo.metaTitle ??= ls.metaTitle as string | undefined;
  dto.seo.metaDescription ??= ls.metaDescription as string | undefined;
  if ((!dto.seo.keywords || dto.seo.keywords.length === 0) && Array.isArray(ls.keywords)) {
    dto.seo.keywords = ls.keywords.filter(
      (k): k is string => typeof k === "string"
    );
  }
  dto.seo.canonicalUrl ??= ls.canonicalUrl as string | undefined;
  dto.seo.ogTitle ??= ls.ogTitle as string | undefined;
  dto.seo.ogDescription ??= ls.ogDescription as string | undefined;
  if (!dto.seo.ogImage && typeof ls.ogImage === "string" && /^https?:\/\//i.test(ls.ogImage)) {
    dto.seo.ogImage = { url: ls.ogImage, publicId: "external" };
  }
}

async function fetchSingletonRaw(): Promise<Record<string, unknown> | null> {
  await connectDB();
  let raw = await SiteSetting.findOne({ key: SITE_SETTINGS_DOCUMENT_KEY }).lean<
    Record<string, unknown>
  >();
  if (!raw)
    raw = await SiteSetting.findOne({ key: LEGACY_KEY_GLOBAL }).lean<
      Record<string, unknown>
    >();
  return raw ?? null;
}

/** Full CMS settings snapshot (singleton). Falls back cleanly if Mongo is unreachable. */
export async function getSiteSettings(): Promise<SiteSettingsDTO> {
  try {
    const rawDoc = await fetchSingletonRaw();
    if (!rawDoc) return getDefaultSiteSettings();

    const dto = siteSettingToDTO(rawDoc as unknown as Record<string, unknown>);
    coerceLegacySocials(dto, rawDoc);
    mergeLegacySeo(dto, rawDoc);

    if (dto.key !== SITE_SETTINGS_DOCUMENT_KEY && rawDoc.key === LEGACY_KEY_GLOBAL) {
      dto.key = SITE_SETTINGS_DOCUMENT_KEY;
    }

    return dto;
  } catch {
    return getDefaultSiteSettings();
  }
}

/** Public-facing subset — safe for Navbar/Footer/TopBar. */
export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  const dto = await getSiteSettings();
  return dtoToPublic(dto);
}

export function dtoToPublic(dto: SiteSettingsDTO): PublicSiteSettings {
  const socialLinks: Pick<
    SiteSettingsSocialLink,
    "platform" | "url" | "isActive" | "order"
  >[] = [...dto.socialLinks]
    .filter((s) => s.isActive !== false && s.url?.trim())
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(({ platform, url, isActive, order }) => ({
      platform,
      url,
      isActive,
      order,
    }));

  const primaryPhone = pickPrimary(dto.phones);
  const primaryEmail = pickPrimary(dto.emails);

  const profilePdfUrl = dto.profilePdf?.url?.trim() || undefined;
  const globalCTA = {
    ...(dto.globalCTA || {}),
    isActive: dto.globalCTA?.isActive === true,
  };

  const copyrightText =
    dto.copyrightText?.trim() ||
    `© ${new Date().getFullYear()} ${dto.siteName || "UESPAK"}. All rights reserved.`;

  return {
    siteName: dto.siteName || "UESPAK",
    tagline: dto.tagline,
    logoUrl: dto.logo?.url?.trim() || undefined,
    darkLogoUrl: dto.darkLogo?.url?.trim() || undefined,
    faviconUrl: dto.favicon?.url?.trim() || undefined,
    primaryPhone,
    primaryEmail,
    address: dto.address?.trim() || undefined,
    workingHours: dto.workingHours?.trim() || undefined,
    mapEmbedUrl: dto.mapEmbedUrl?.trim() || undefined,
    socialLinks,
    profilePdfUrl,
    profileButtonText: dto.profileButtonText?.trim() || "Download Profile",
    footerText: dto.footerText?.trim() || undefined,
    footerDescription:
      dto.footerDescription?.trim() ||
      "Engineering Excellence. Delivering world-class EPC solutions.",
    copyrightText,
    globalCTA,
  };
}

/**
 * Persist singleton key normalization (migrate legacy `"global"` key to stable key).
 */
export async function normalizeSiteSettingKey(): Promise<void> {
  await connectDB();
  await SiteSetting.updateMany(
    { key: LEGACY_KEY_GLOBAL },
    { $set: { key: SITE_SETTINGS_DOCUMENT_KEY } }
  ).catch(() => undefined);
}

export function mongooseIdFrom(adminId: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(adminId);
}
