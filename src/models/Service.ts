import mongoose, { Document, Model, Schema } from "mongoose";
import type { MediaObject } from "@/types/media";
import type { SeoData } from "@/types/seo";

export interface IService extends Document {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  category?: string;
  icon?: string;
  featuredImage?: MediaObject;
  gallery: MediaObject[];
  bulletPoints: string[];
  faqs: Array<{ question: string; answer: string }>;
  cta?: {
    title?: string;
    description?: string;
    buttonText?: string;
    buttonUrl?: string;
    isActive: boolean;
  };
  isFeatured: boolean;
  seo?: SeoData;
  status: "draft" | "published" | "archived";
  order: number;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const mediaObjectSchema = new Schema<MediaObject>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    fileId: { type: String, trim: true },
    altText: { type: String, trim: true },
    width: { type: Number },
    height: { type: Number },
    format: { type: String, trim: true },
    size: { type: Number },
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
    ogImage: mediaObjectSchema,
    robots: {
      index: { type: Boolean, default: true },
      follow: { type: Boolean, default: true },
    },
    schemaType: { type: String, trim: true, default: "Service" },
  },
  { _id: false }
);

const serviceSchema = new Schema<IService>(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    excerpt: { type: String, trim: true },
    content: { type: String },
    category: { type: String, trim: true },
    icon: { type: String, trim: true },
    featuredImage: mediaObjectSchema,
    gallery: { type: [mediaObjectSchema], default: [] },
    bulletPoints: { type: [{ type: String, trim: true }], default: [] },
    faqs: {
      type: [
        new Schema(
          {
            question: { type: String, required: true, trim: true },
            answer: { type: String, required: true, trim: true },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    cta: {
      type: new Schema(
        {
          title: { type: String, trim: true },
          description: { type: String, trim: true },
          buttonText: { type: String, trim: true },
          buttonUrl: { type: String, trim: true },
          isActive: { type: Boolean, default: false },
        },
        { _id: false }
      ),
      default: { isActive: false },
    },
    isFeatured: { type: Boolean, default: false },
    seo: seoSchema,
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    order: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

serviceSchema.index({ slug: 1 }, { unique: true });
serviceSchema.index({ status: 1 });
serviceSchema.index({ isFeatured: 1 });
serviceSchema.index({ order: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ createdAt: -1 });

export const Service: Model<IService> =
  mongoose.models.Service ??
  mongoose.model<IService>("Service", serviceSchema);
