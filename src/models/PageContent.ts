import mongoose, { Document, Model, Schema } from "mongoose";
import type { MediaObject } from "@/types/media";
import type { SeoData } from "@/types/seo";
import type { PageKey } from "@/types/page-content";
import { PAGE_KEYS } from "@/types/page-content";

export interface IPageContent extends Document {
  pageKey: PageKey;
  title: string;
  slug: string;
  isActive: boolean;
  hero: {
    eyebrow?: string;
    title?: string;
    description?: string;
    backgroundImage?: MediaObject;
    overlayOpacity?: number;
    primaryButtonText?: string;
    primaryButtonUrl?: string;
    secondaryButtonText?: string;
    secondaryButtonUrl?: string;
  };
  sections: Record<string, unknown>;
  seo: SeoData;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const mediaSchema = new Schema<MediaObject>(
  {
    url: { type: String, required: true },
    publicId: { type: String, trim: true },
    fileId: { type: String, trim: true },
    altText: { type: String, trim: true },
    width: { type: Number },
    height: { type: Number },
    format: { type: String, trim: true },
    size: { type: Number },
    mimeType: { type: String, trim: true },
  },
  { _id: false }
);

const seoSchema = new Schema<SeoData>(
  {
    metaTitle: { type: String, trim: true, maxlength: 70 },
    metaDescription: { type: String, trim: true, maxlength: 180 },
    keywords: [{ type: String, trim: true }],
    canonicalUrl: { type: String, trim: true },
    ogTitle: { type: String, trim: true },
    ogDescription: { type: String, trim: true },
    ogImage: mediaSchema,
    robots: {
      index: { type: Boolean, default: true },
      follow: { type: Boolean, default: true },
    },
    schemaType: { type: String, trim: true },
  },
  { _id: false }
);

const heroSchema = new Schema(
  {
    eyebrow: { type: String, trim: true },
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    backgroundImage: mediaSchema,
    overlayOpacity: { type: Number, min: 0, max: 1 },
    primaryButtonText: { type: String, trim: true },
    primaryButtonUrl: { type: String, trim: true },
    secondaryButtonText: { type: String, trim: true },
    secondaryButtonUrl: { type: String, trim: true },
  },
  { _id: false }
);

/**
 * Page sections are stored as `Schema.Types.Mixed` because each `pageKey`
 * (about/careers/contact) has a different nested shape. Validation lives in
 * the Zod validator (`src/validators/page-content.validator.ts`); the
 * Mongoose schema purposefully stays permissive so partial updates and
 * future fields don't get stripped silently. `strict: false` is used on
 * writes as an additional safety net (see the admin API route).
 */
const pageContentSchema = new Schema<IPageContent>(
  {
    pageKey: {
      type: String,
      required: true,
      unique: true,
      enum: [...PAGE_KEYS],
      trim: true,
    },
    title: { type: String, trim: true },
    slug: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    hero: { type: heroSchema, default: () => ({}) },
    sections: { type: Schema.Types.Mixed, default: () => ({}) },
    seo: { type: seoSchema, default: () => ({}) },
    createdBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
  },
  { timestamps: true, minimize: false }
);

pageContentSchema.index({ pageKey: 1 }, { unique: true });
pageContentSchema.index({ createdAt: -1 });

// IMPORTANT: re-register on HMR so a stale strict schema does not strip
// freshly added nested fields on writes (mirrors HomePage model pattern).
if (mongoose.models.PageContent) {
  mongoose.deleteModel("PageContent");
}

export const PageContent: Model<IPageContent> = mongoose.model<IPageContent>(
  "PageContent",
  pageContentSchema
);
