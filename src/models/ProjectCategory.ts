import mongoose, { Document, Model, Schema } from "mongoose";
import type { SeoData } from "@/types/seo";
import type { ProjectGroup, ProjectCategoryStatus } from "@/types/project";
import { mediaSchema } from "@/models/AdminUser";

export interface IProjectCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  projectGroup?: ProjectGroup;
  order: number;
  status: ProjectCategoryStatus;
  seo?: SeoData;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
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
    schemaType: { type: String, trim: true, default: "CollectionPage" },
  },
  { _id: false }
);

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
    projectGroup: {
      type: String,
      enum: ["engineering", "agriculture", "industrialAutomation"],
    },
    order: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
      default: "active",
    },
    seo: seoSchema,
    createdBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
  },
  { timestamps: true }
);

projectCategorySchema.index({ status: 1 });
projectCategorySchema.index({ projectGroup: 1 });
projectCategorySchema.index({ order: 1 });
projectCategorySchema.index({ createdAt: -1 });

export const ProjectCategory: Model<IProjectCategory> =
  mongoose.models.ProjectCategory ??
  mongoose.model<IProjectCategory>("ProjectCategory", projectCategorySchema);

