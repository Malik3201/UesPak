import type { SiteSettingsDTO } from "@/types/site-settings";
import type { MediaObject } from "@/types/media";
import { SITE_SETTINGS_DOCUMENT_KEY } from "./site-settings";

export const EMPTY_MEDIA: MediaObject = {
  url: "",
  publicId: "",
  altText: "",
};

export const DEFAULT_SITE_SETTINGS_DTO: SiteSettingsDTO = {
  key: SITE_SETTINGS_DOCUMENT_KEY,
  siteName: "UESPAK",
  tagline: undefined,
  logo: undefined,
  darkLogo: undefined,
  favicon: undefined,
  phones: [],
  emails: [],
  address: undefined,
  workingHours: undefined,
  mapEmbedUrl: undefined,
  socialLinks: [],
  profilePdf: undefined,
  profileButtonText: "Download Profile",
  footerText: undefined,
  copyrightText: undefined,
  footerDescription: undefined,
  globalCTA: {
    title: "",
    description: "",
    buttonText: "",
    buttonUrl: "",
    isActive: false,
  },
  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: [],
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    schemaType: "",
    robots: { index: true, follow: true },
  },
};

export function cloneDefaultSiteSettings(): SiteSettingsDTO {
  return structuredClone(DEFAULT_SITE_SETTINGS_DTO);
}

/** Prepare DTO from API for controlled form fields (empty media rows). */
export function siteSettingsDtoToForm(dto: SiteSettingsDTO): SiteSettingsDTO {
  return {
    ...dto,
    globalCTA: {
      title: dto.globalCTA?.title ?? "",
      description: dto.globalCTA?.description ?? "",
      buttonText: dto.globalCTA?.buttonText ?? "",
      buttonUrl: dto.globalCTA?.buttonUrl ?? "",
      isActive: dto.globalCTA?.isActive === true,
    },
    logo: dto.logo?.url?.trim() ? dto.logo : EMPTY_MEDIA,
    darkLogo: dto.darkLogo?.url?.trim() ? dto.darkLogo : EMPTY_MEDIA,
    favicon: dto.favicon?.url?.trim() ? dto.favicon : EMPTY_MEDIA,
    profilePdf: dto.profilePdf?.url?.trim() ? dto.profilePdf : EMPTY_MEDIA,
    seo: {
      ...dto.seo,
      metaTitle: dto.seo.metaTitle ?? "",
      metaDescription: dto.seo.metaDescription ?? "",
      keywords: [...(dto.seo.keywords ?? [])],
      canonicalUrl: dto.seo.canonicalUrl ?? "",
      ogTitle: dto.seo.ogTitle ?? "",
      ogDescription: dto.seo.ogDescription ?? "",
      schemaType: dto.seo.schemaType ?? "",
      robots: {
        index: dto.seo.robots?.index !== false,
        follow: dto.seo.robots?.follow !== false,
      },
      ogImage: dto.seo.ogImage?.url?.trim()
        ? dto.seo.ogImage
        : EMPTY_MEDIA,
    },
    phones: dto.phones?.length ? [...dto.phones] : [],
    emails: dto.emails?.length ? [...dto.emails] : [],
    socialLinks: dto.socialLinks?.length ? [...dto.socialLinks] : [],
  };
}
