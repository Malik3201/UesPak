import mongoose, { Document, Model, Schema } from "mongoose";
import { mediaSchema, seoSchema } from "./AdminUser";
import type { MediaObject } from "@/types/media";
import type { SeoData } from "@/types/seo";

// ─── ProjectCategory ──────────────────────────────────────────────────────────
export interface IProjectCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const projectCategorySchema = new Schema<IProjectCategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

projectCategorySchema.index({ slug: 1 }, { unique: true });

export const ProjectCategory: Model<IProjectCategory> =
  mongoose.models.ProjectCategory ??
  mongoose.model<IProjectCategory>("ProjectCategory", projectCategorySchema);

// ─── Project ──────────────────────────────────────────────────────────────────
export interface IProject extends Document {
  title: string;
  slug: string;
  excerpt?: string;
  body?: string;
  client?: string;
  location?: string;
  completionYear?: number;
  category?: mongoose.Types.ObjectId;
  featuredImage?: MediaObject;
  gallery?: MediaObject[];
  seo?: SeoData;
  status: "draft" | "published" | "archived";
  featured: boolean;
  order: number;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

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
    excerpt: { type: String, trim: true },
    body: { type: String },
    client: { type: String, trim: true },
    location: { type: String, trim: true },
    completionYear: { type: Number },
    category: { type: Schema.Types.ObjectId, ref: "ProjectCategory" },
    featuredImage: mediaSchema,
    gallery: [mediaSchema],
    seo: seoSchema,
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
  },
  { timestamps: true }
);

projectSchema.index({ slug: 1 }, { unique: true });
projectSchema.index({ status: 1, featured: 1, order: 1 });
projectSchema.index({ category: 1 });

export const Project: Model<IProject> =
  mongoose.models.Project ??
  mongoose.model<IProject>("Project", projectSchema);
