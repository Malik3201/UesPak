import mongoose, { Document, Model, Schema } from "mongoose";
import type { MediaObject } from "@/types/media";
import type { SeoData } from "@/types/seo";
import type {
  JobExperienceLevel,
  JobType,
  JobWorkMode,
} from "@/types/job";

export interface IJob extends Document {
  title: string;
  slug: string;
  department?: string;
  location?: string;
  jobType: JobType;
  workMode: JobWorkMode;
  experienceLevel: JobExperienceLevel;
  experienceRequired?: string;
  shortDescription?: string;
  description?: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  skills: string[];
  applyEmail?: string;
  applyUrl?: string;
  applicationInstructions?: string;
  deadline?: Date;
  status: "draft" | "published" | "archived";
  isFeatured: boolean;
  order: number;
  seo?: SeoData;
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
    ogDescription: { type: String, trim: true, maxlength: 180 },
    ogImage: mediaObjectSchema,
    robots: {
      index: { type: Boolean, default: true },
      follow: { type: Boolean, default: true },
    },
    schemaType: { type: String, trim: true, default: "JobPosting" },
  },
  { _id: false }
);

const jobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    department: { type: String, trim: true },
    location: { type: String, trim: true },
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "remote"],
      default: "full-time",
    },
    workMode: {
      type: String,
      enum: ["on-site", "hybrid", "remote"],
      default: "on-site",
    },
    experienceLevel: {
      type: String,
      enum: ["entry", "mid", "senior", "lead", "internship"],
      default: "mid",
    },
    experienceRequired: { type: String, trim: true },
    shortDescription: { type: String, trim: true, maxlength: 240 },
    description: { type: String },
    responsibilities: { type: [{ type: String, trim: true }], default: [] },
    requirements: { type: [{ type: String, trim: true }], default: [] },
    benefits: { type: [{ type: String, trim: true }], default: [] },
    skills: { type: [{ type: String, trim: true }], default: [] },
    applyEmail: { type: String, trim: true, lowercase: true },
    applyUrl: { type: String, trim: true },
    applicationInstructions: { type: String, trim: true },
    deadline: { type: Date },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    isFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    seo: seoSchema,
    createdBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

jobSchema.index({ status: 1, order: 1, createdAt: -1 });
jobSchema.index({ department: 1 });
jobSchema.index({ isFeatured: 1 });

export const Job: Model<IJob> =
  mongoose.models.Job ?? mongoose.model<IJob>("Job", jobSchema);
