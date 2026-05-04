import mongoose, { Document, Model, Schema } from "mongoose";
import { mediaSchema } from "./AdminUser";
import type { MediaObject } from "@/types/media";
import { SITE_SETTINGS_DOCUMENT_KEY } from "@/constants/site-settings";
import type {
  SiteSettingsDTO,
  SiteSettingsEmail,
  SiteSettingsGlobalCTA,
  SiteSettingsPhone,
  SiteSettingsSeo,
  SiteSettingsSocialLink,
} from "@/types/site-settings";

export interface ISiteSetting extends Document {
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
  /** @deprecated Legacy single phone (read for migration). */
  phone?: string;
  /** @deprecated Legacy single email. */
  email?: string;
  /** @deprecated Legacy social URLs. */
  linkedIn?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  /** @deprecated Older SEO bucket name. */
  defaultSeo?: SiteSettingsSeo;
  googleAnalyticsId?: string;
  maintenanceMode?: boolean;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const phoneEntrySchema = new Schema<SiteSettingsPhone>(
  {
    label: { type: String, trim: true },
    value: { type: String, trim: true, required: true },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

const emailEntrySchema = new Schema<SiteSettingsEmail>(
  {
    label: { type: String, trim: true },
    value: { type: String, trim: true, required: true },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

const socialLinkSchema = new Schema<SiteSettingsSocialLink>(
  {
    platform: { type: String, trim: true, required: true },
    url: { type: String, trim: true, required: true },
    icon: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const globalCTASchema = new Schema<SiteSettingsGlobalCTA>(
  {
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    buttonText: { type: String, trim: true },
    buttonUrl: { type: String, trim: true },
    isActive: { type: Boolean, default: false },
  },
  { _id: false }
);

const robotsSchema = new Schema(
  {
    index: { type: Boolean, default: true },
    follow: { type: Boolean, default: true },
  },
  { _id: false }
);

const siteSeoSchema = new Schema<SiteSettingsSeo>(
  {
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    keywords: [{ type: String, trim: true }],
    canonicalUrl: { type: String, trim: true },
    ogTitle: { type: String, trim: true },
    ogDescription: { type: String, trim: true },
    ogImage: mediaSchema,
    robots: { type: robotsSchema, default: () => ({ index: true, follow: true }) },
    schemaType: { type: String, trim: true },
  },
  { _id: false }
);

const siteSettingSchema = new Schema<ISiteSetting>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: SITE_SETTINGS_DOCUMENT_KEY,
      trim: true,
    },
    siteName: { type: String, trim: true, default: "UESPAK" },
    tagline: { type: String, trim: true },
    logo: mediaSchema,
    darkLogo: mediaSchema,
    favicon: mediaSchema,

    phones: { type: [phoneEntrySchema], default: [] },
    emails: { type: [emailEntrySchema], default: [] },
    address: { type: String, trim: true },
    workingHours: { type: String, trim: true },
    mapEmbedUrl: { type: String, trim: true },

    socialLinks: { type: [socialLinkSchema], default: [] },

    profilePdf: mediaSchema,
    profileButtonText: {
      type: String,
      trim: true,
      default: "Download Profile",
    },

    footerText: { type: String, trim: true },
    copyrightText: { type: String, trim: true },
    footerDescription: { type: String, trim: true },

    globalCTA: {
      type: globalCTASchema,
      default: () => ({ isActive: false }),
    },
    seo: {
      type: siteSeoSchema,
      default: () => ({
        robots: { index: true, follow: true },
      }),
    },

    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    linkedIn: { type: String, trim: true },
    twitter: { type: String, trim: true },
    facebook: { type: String, trim: true },
    instagram: { type: String, trim: true },
    defaultSeo: { type: Schema.Types.Mixed },
    googleAnalyticsId: { type: String, trim: true },
    maintenanceMode: { type: Boolean, default: false },

    createdBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
  },
  { timestamps: true }
);

siteSettingSchema.index({ key: 1 }, { unique: true });

export const SiteSetting: Model<ISiteSetting> =
  mongoose.models.SiteSetting ??
  mongoose.model<ISiteSetting>("SiteSetting", siteSettingSchema);

/** Serialize model document to API/form DTO shape. */
export function siteSettingToDTO(doc: ISiteSetting | Record<string, unknown>): SiteSettingsDTO {
  const o =
    typeof (doc as ISiteSetting).toObject === "function"
      ? (doc as ISiteSetting).toObject()
      : (doc as Record<string, unknown>);

  const g = o.globalCTA && typeof o.globalCTA === "object"
    ? (o.globalCTA as SiteSettingsGlobalCTA)
    : undefined;

  const seoSrc = (o.seo && typeof o.seo === "object" ? o.seo : {}) as Partial<SiteSettingsSeo>;

  return {
    key: typeof o.key === "string" ? o.key : SITE_SETTINGS_DOCUMENT_KEY,
    siteName: typeof o.siteName === "string" ? o.siteName : "UESPAK",
    tagline: o.tagline as string | undefined,
    logo: o.logo as MediaObject | undefined,
    darkLogo: o.darkLogo as MediaObject | undefined,
    favicon: o.favicon as MediaObject | undefined,
    phones: Array.isArray(o.phones) ? (o.phones as SiteSettingsPhone[]) : [],
    emails: Array.isArray(o.emails) ? (o.emails as SiteSettingsEmail[]) : [],
    address: o.address as string | undefined,
    workingHours: o.workingHours as string | undefined,
    mapEmbedUrl: o.mapEmbedUrl as string | undefined,
    socialLinks: Array.isArray(o.socialLinks)
      ? (o.socialLinks as SiteSettingsSocialLink[])
      : [],
    profilePdf: o.profilePdf as MediaObject | undefined,
    profileButtonText:
      typeof o.profileButtonText === "string"
        ? o.profileButtonText
        : "Download Profile",
    footerText: o.footerText as string | undefined,
    copyrightText: o.copyrightText as string | undefined,
    footerDescription: o.footerDescription as string | undefined,
    globalCTA: {
      title: g?.title,
      description: g?.description,
      buttonText: g?.buttonText,
      buttonUrl: g?.buttonUrl,
      isActive: Boolean(g?.isActive),
    },
    seo: {
      metaTitle: seoSrc.metaTitle,
      metaDescription: seoSrc.metaDescription,
      keywords: Array.isArray(seoSrc.keywords)
        ? (seoSrc.keywords as string[])
        : [],
      canonicalUrl: seoSrc.canonicalUrl,
      ogTitle: seoSrc.ogTitle,
      ogDescription: seoSrc.ogDescription,
      ogImage: seoSrc.ogImage,
      robots:
        seoSrc.robots && typeof seoSrc.robots === "object"
          ? {
              index: Boolean(seoSrc.robots.index ?? true),
              follow: Boolean(seoSrc.robots.follow ?? true),
            }
          : { index: true, follow: true },
      schemaType: seoSrc.schemaType,
    },
    createdBy:
      o.createdBy && typeof (o.createdBy as { toString(): string }).toString === "function"
        ? (o.createdBy as { toString(): string }).toString()
        : undefined,
    updatedBy:
      o.updatedBy && typeof (o.updatedBy as { toString(): string }).toString === "function"
        ? (o.updatedBy as { toString(): string }).toString()
        : undefined,
    createdAt:
      o.createdAt instanceof Date
        ? o.createdAt.toISOString()
        : typeof o.createdAt === "string"
          ? o.createdAt
          : undefined,
    updatedAt:
      o.updatedAt instanceof Date
        ? o.updatedAt.toISOString()
        : typeof o.updatedAt === "string"
          ? o.updatedAt
          : undefined,
  };
}
