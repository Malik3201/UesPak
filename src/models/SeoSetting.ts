import mongoose, { Document, Model, Schema } from "mongoose";
import { mediaSchema } from "./AdminUser";
import { SEO_SETTINGS_DOCUMENT_KEY } from "@/constants/seo-settings";
import type { SeoSettingsDTO, TwitterCardType } from "@/types/seo-setting";
import type { MediaObject } from "@/types/media";

export interface ISeoSetting extends Document {
  key: string;
  siteName: string;
  siteUrl: string;
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  defaultKeywords: string[];
  defaultOgTitle: string;
  defaultOgDescription: string;
  defaultOgImage?: MediaObject;
  twitterCard: TwitterCardType;
  robots: { index: boolean; follow: boolean };
  googleSearchConsoleVerification?: string;
  bingVerification?: string;
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  canonicalBaseUrl?: string;
  sitemapEnabled: boolean;
  robotsTxtEnabled: boolean;
  noIndexPaths: string[];
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const seoSettingSchema = new Schema<ISeoSetting>(
  {
    key: { type: String, required: true, unique: true, default: SEO_SETTINGS_DOCUMENT_KEY },
    siteName: { type: String, trim: true, default: "UESPAK" },
    siteUrl: { type: String, trim: true },
    defaultMetaTitle: { type: String, trim: true, maxlength: 70 },
    defaultMetaDescription: { type: String, trim: true, maxlength: 180 },
    defaultKeywords: { type: [{ type: String, trim: true }], default: [] },
    defaultOgTitle: { type: String, trim: true },
    defaultOgDescription: { type: String, trim: true, maxlength: 180 },
    defaultOgImage: mediaSchema,
    twitterCard: {
      type: String,
      enum: ["summary", "summary_large_image"],
      default: "summary_large_image",
    },
    robots: {
      index: { type: Boolean, default: true },
      follow: { type: Boolean, default: true },
    },
    googleSearchConsoleVerification: { type: String, trim: true },
    bingVerification: { type: String, trim: true },
    googleAnalyticsId: { type: String, trim: true },
    googleTagManagerId: { type: String, trim: true },
    canonicalBaseUrl: { type: String, trim: true },
    sitemapEnabled: { type: Boolean, default: true },
    robotsTxtEnabled: { type: Boolean, default: true },
    noIndexPaths: { type: [{ type: String, trim: true }], default: [] },
    updatedBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
  },
  { timestamps: true }
);

export function seoSettingToDTO(doc: ISeoSetting): SeoSettingsDTO {
  return {
    siteName: doc.siteName || "UESPAK",
    siteUrl: doc.siteUrl || "",
    defaultMetaTitle: doc.defaultMetaTitle || "",
    defaultMetaDescription: doc.defaultMetaDescription || "",
    defaultKeywords: doc.defaultKeywords || [],
    defaultOgTitle: doc.defaultOgTitle || "",
    defaultOgDescription: doc.defaultOgDescription || "",
    defaultOgImage: doc.defaultOgImage,
    twitterCard: doc.twitterCard || "summary_large_image",
    robots: {
      index: doc.robots?.index !== false,
      follow: doc.robots?.follow !== false,
    },
    googleSearchConsoleVerification: doc.googleSearchConsoleVerification,
    bingVerification: doc.bingVerification,
    googleAnalyticsId: doc.googleAnalyticsId,
    googleTagManagerId: doc.googleTagManagerId,
    canonicalBaseUrl: doc.canonicalBaseUrl,
    sitemapEnabled: doc.sitemapEnabled !== false,
    robotsTxtEnabled: doc.robotsTxtEnabled !== false,
    noIndexPaths: doc.noIndexPaths || [],
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

export const SeoSetting: Model<ISeoSetting> =
  mongoose.models.SeoSetting ??
  mongoose.model<ISeoSetting>("SeoSetting", seoSettingSchema);
