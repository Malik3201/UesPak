import mongoose, { Document, Model, Schema } from "mongoose";
import { mediaSchema } from "@/models/AdminUser";
import type { MediaObject } from "@/types/media";
import type { SeoData } from "@/types/seo";
import type { ProjectGroup } from "@/types/project";

export interface IProject extends Document {
  title: string;
  slug: string;
  projectGroup: ProjectGroup;
  categoryIds: mongoose.Types.ObjectId[];
  categoriesSnapshot?: Array<{ id?: string; name: string; slug: string }>;
  excerpt?: string;
  description?: string;
  content?: string;
  status: "draft" | "published" | "archived";
  order: number;
  isFeatured: boolean;
  site?: string;
  client?: string;
  location?: string;
  discipline?: string;
  commissioningDate?: Date;
  servicesProvided: string[];
  scope?: string;
  scopeItems: string[];
  technologies: string[];
  outcomes: string[];
  featuredImage?: MediaObject;
  gallery: MediaObject[];
  linkedServices: mongoose.Types.ObjectId[];
  cta: {
    title?: string;
    description?: string;
    buttonText?: string;
    buttonUrl?: string;
    isActive: boolean;
  };
  seo?: SeoData;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

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
    schemaType: { type: String, trim: true, default: "CreativeWork" },
  },
  { _id: false }
);

const projectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    projectGroup: {
      type: String,
      enum: ["engineering", "agriculture", "industrialAutomation"],
      default: "engineering",
    },
    categoryIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "ProjectCategory" }],
      default: [],
    },
    categoriesSnapshot: {
      type: [
        new Schema(
          {
            id: { type: String, trim: true },
            name: { type: String, required: true, trim: true },
            slug: { type: String, required: true, trim: true },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    excerpt: { type: String, trim: true },
    description: { type: String, trim: true },
    content: { type: String },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    order: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    site: { type: String, trim: true },
    client: { type: String, trim: true },
    location: { type: String, trim: true },
    discipline: { type: String, trim: true },
    commissioningDate: { type: Date },
    servicesProvided: { type: [{ type: String, trim: true }], default: [] },
    scope: { type: String, trim: true },
    scopeItems: { type: [{ type: String, trim: true }], default: [] },
    technologies: { type: [{ type: String, trim: true }], default: [] },
    outcomes: { type: [{ type: String, trim: true }], default: [] },
    featuredImage: mediaSchema,
    gallery: { type: [mediaSchema], default: [] },
    linkedServices: {
      type: [{ type: Schema.Types.ObjectId, ref: "Service" }],
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
    seo: seoSchema,
    createdBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

projectSchema.index({ projectGroup: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ isFeatured: 1 });
projectSchema.index({ order: 1 });
projectSchema.index({ categoryIds: 1 });
projectSchema.index({ linkedServices: 1 });
projectSchema.index({ createdAt: -1 });

export const Project: Model<IProject> =
  mongoose.models.Project ?? mongoose.model<IProject>("Project", projectSchema);
