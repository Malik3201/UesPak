import mongoose, { Document, Model, Schema } from "mongoose";
import { mediaSchema, seoSchema } from "./AdminUser";
import type { MediaObject } from "@/types/media";
import type { SeoData } from "@/types/seo";

export interface ISiteSetting extends Document {
  key: string;
  // General
  siteName?: string;
  tagline?: string;
  logo?: MediaObject;
  favicon?: MediaObject;
  // Contact
  phone?: string;
  email?: string;
  address?: string;
  // Social
  linkedIn?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  // SEO defaults
  defaultSeo?: SeoData;
  // Analytics
  googleAnalyticsId?: string;
  // Maintenance
  maintenanceMode?: boolean;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const siteSettingSchema = new Schema<ISiteSetting>(
  {
    key: { type: String, required: true, unique: true, default: "global" },
    siteName: { type: String, trim: true },
    tagline: { type: String, trim: true },
    logo: mediaSchema,
    favicon: mediaSchema,
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    address: { type: String, trim: true },
    linkedIn: { type: String, trim: true },
    twitter: { type: String, trim: true },
    facebook: { type: String, trim: true },
    instagram: { type: String, trim: true },
    defaultSeo: seoSchema,
    googleAnalyticsId: { type: String, trim: true },
    maintenanceMode: { type: Boolean, default: false },
    updatedBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
  },
  { timestamps: true }
);

siteSettingSchema.index({ key: 1 }, { unique: true });

export const SiteSetting: Model<ISiteSetting> =
  mongoose.models.SiteSetting ??
  mongoose.model<ISiteSetting>("SiteSetting", siteSettingSchema);
