import type { MediaObject } from "@/types/media";

export interface SiteSettingsPhone {
  label?: string;
  value: string;
  isPrimary?: boolean;
}

export interface SiteSettingsEmail {
  label?: string;
  value: string;
  isPrimary?: boolean;
}

export interface SiteSettingsSocialLink {
  platform: string;
  url: string;
  icon?: string;
  isActive: boolean;
  order: number;
}

export interface SiteSettingsGlobalCTA {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string;
  isActive?: boolean;
}

export interface SiteSettingsSeo {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: MediaObject;
  robots?: {
    index: boolean;
    follow: boolean;
  };
  schemaType?: string;
}

/** Full editable site settings (admin API + form). */
export interface SiteSettingsDTO {
  key: string;
  siteName: string;
  tagline?: string;
  logo?: MediaObject;
  darkLogo?: MediaObject;
  favicon?: MediaObject;
  phones: SiteSettingsPhone[];
  emails: SiteSettingsEmail[];
  address?: string;
  workingHours?: string;
  mapEmbedUrl?: string;
  socialLinks: SiteSettingsSocialLink[];
  profilePdf?: MediaObject;
  profileButtonText?: string;
  footerText?: string;
  copyrightText?: string;
  footerDescription?: string;
  globalCTA: SiteSettingsGlobalCTA;
  seo: SiteSettingsSeo;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Minimal safe shape for public layout components. */
export interface PublicSiteSettings {
  siteName: string;
  tagline?: string;
  logoUrl?: string;
  darkLogoUrl?: string;
  faviconUrl?: string;
  primaryPhone?: string;
  primaryEmail?: string;
  address?: string;
  workingHours?: string;
  mapEmbedUrl?: string;
  socialLinks: Pick<
    SiteSettingsSocialLink,
    "platform" | "url" | "isActive" | "order"
  >[];
  profilePdfUrl?: string;
  profileButtonText: string;
  footerText?: string;
  footerDescription?: string;
  copyrightText?: string;
  globalCTA: SiteSettingsGlobalCTA;
}
