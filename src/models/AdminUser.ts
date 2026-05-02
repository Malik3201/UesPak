import mongoose, { Document, Model, Schema } from "mongoose";
import type { MediaObject } from "@/types/media";
import type { SeoData } from "@/types/seo";
import type { AdminRole, AdminStatus } from "@/types/admin";

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

const ADMIN_ROLE_VALUES: AdminRole[] = ["superAdmin", "admin", "editor"];
const ADMIN_STATUS_VALUES: AdminStatus[] = [
  "active",
  "inactive",
  "suspended",
];

// ─── AdminUser ─────────────────────────────────────────────────────────────────
export interface IAdminUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  status: AdminStatus;
  lastLogin?: Date;
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
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ADMIN_ROLE_VALUES,
      default: "editor",
    },
    status: {
      type: String,
      enum: ADMIN_STATUS_VALUES,
      default: "active",
    },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

adminUserSchema.index({ email: 1 }, { unique: true });
adminUserSchema.index({ role: 1 });
adminUserSchema.index({ status: 1 });

export const AdminUser: Model<IAdminUser> =
  mongoose.models.AdminUser ??
  mongoose.model<IAdminUser>("AdminUser", adminUserSchema);
