import mongoose, { Document, Model, Schema } from "mongoose";
import type { MediaObject } from "@/types/media";
import type { SeoData } from "@/types/seo";

// ─── SEO subdocument schema (reusable) ────────────────────────────────────────
export const seoSchema = new Schema<SeoData>(
  {
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    keywords: [{ type: String, trim: true }],
    canonicalUrl: { type: String, trim: true },
    ogTitle: { type: String, trim: true },
    ogDescription: { type: String, trim: true },
    ogImage: { type: String, trim: true },
    robots: {
      index: { type: Boolean, default: true },
      follow: { type: Boolean, default: true },
    },
    schemaType: { type: String, trim: true },
  },
  { _id: false }
);

// ─── Media subdocument schema (reusable) ──────────────────────────────────────
export const mediaSchema = new Schema<MediaObject>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    altText: { type: String, trim: true },
    width: { type: Number },
    height: { type: Number },
    format: { type: String },
    size: { type: Number },
  },
  { _id: false }
);

// ─── AdminUser ─────────────────────────────────────────────────────────────────
export interface IAdminUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "super_admin" | "admin" | "editor";
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const adminUserSchema = new Schema<IAdminUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["super_admin", "admin", "editor"],
      default: "admin",
    },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

adminUserSchema.index({ email: 1 }, { unique: true });

export const AdminUser: Model<IAdminUser> =
  mongoose.models.AdminUser ??
  mongoose.model<IAdminUser>("AdminUser", adminUserSchema);
