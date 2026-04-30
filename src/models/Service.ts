import mongoose, { Document, Model, Schema } from "mongoose";
import { mediaSchema, seoSchema } from "./AdminUser";
import type { MediaObject } from "@/types/media";
import type { SeoData } from "@/types/seo";

export interface IService extends Document {
  title: string;
  slug: string;
  excerpt?: string;
  body?: string;
  featuredImage?: MediaObject;
  seo?: SeoData;
  status: "draft" | "published" | "archived";
  order: number;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

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
    body: { type: String },
    featuredImage: mediaSchema,
    seo: seoSchema,
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    order: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
  },
  { timestamps: true }
);

serviceSchema.index({ slug: 1 }, { unique: true });
serviceSchema.index({ status: 1, order: 1 });

export const Service: Model<IService> =
  mongoose.models.Service ??
  mongoose.model<IService>("Service", serviceSchema);
