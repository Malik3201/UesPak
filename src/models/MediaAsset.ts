import mongoose, { Document, Model, Schema } from "mongoose";
import type { MediaObject } from "@/types/media";

export type MediaAssetType = "image" | "pdf" | "document" | "other";
export type MediaAssetStatus = "active" | "archived";

export interface IMediaAsset extends Document {
  url: string;
  secureUrl: string;
  publicId: string;
  fileId?: string;
  provider?: "imagekit" | "cloudinary";
  type: MediaAssetType;
  resourceType: "image" | "raw";
  filename?: string;
  originalFilename?: string;
  altText?: string;
  caption?: string;
  folder: string;
  format: string;
  size: number;
  width?: number;
  height?: number;
  mimeType?: string;
  usage?: string;
  tags?: string[];
  uploadedBy?: mongoose.Types.ObjectId;
  status: MediaAssetStatus;
  createdAt: Date;
  updatedAt: Date;
}

const mediaAssetSchema = new Schema<IMediaAsset>(
  {
    url: { type: String, required: true },
    secureUrl: { type: String, required: true },
    publicId: { type: String, required: true, unique: true },
    fileId: { type: String, trim: true },
    provider: {
      type: String,
      enum: ["imagekit", "cloudinary"],
      default: "imagekit",
    },
    type: {
      type: String,
      enum: ["image", "pdf", "document", "other"],
      required: true,
      default: "image",
    },
    resourceType: {
      type: String,
      enum: ["image", "raw"],
      default: "image",
    },
    filename: { type: String, trim: true },
    originalFilename: { type: String, trim: true },
    altText: { type: String, trim: true },
    caption: { type: String, trim: true },
    folder: { type: String, required: true },
    format: { type: String, required: true },
    size: { type: Number, required: true },
    width: { type: Number },
    height: { type: Number },
    mimeType: { type: String, trim: true },
    usage: { type: String, trim: true },
    tags: [{ type: String }],
    uploadedBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
    },
  },
  { timestamps: true }
);

mediaAssetSchema.index({ publicId: 1 }, { unique: true });
mediaAssetSchema.index({ fileId: 1 });
mediaAssetSchema.index({ provider: 1 });
mediaAssetSchema.index({ type: 1 });
mediaAssetSchema.index({ folder: 1, resourceType: 1 });
mediaAssetSchema.index({ uploadedBy: 1 });
mediaAssetSchema.index({ status: 1 });
mediaAssetSchema.index({ createdAt: -1 });
mediaAssetSchema.index({ tags: 1 });

export const MediaAsset: Model<IMediaAsset> =
  mongoose.models.MediaAsset ??
  mongoose.model<IMediaAsset>("MediaAsset", mediaAssetSchema);

export type { MediaObject };
