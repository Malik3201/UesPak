import mongoose, { Document, Model, Schema } from "mongoose";
import type { MediaObject } from "@/types/media";

export interface IMediaAsset extends Document {
  url: string;
  secureUrl: string;
  publicId: string;
  altText?: string;
  caption?: string;
  width?: number;
  height?: number;
  format: string;
  size: number;
  resourceType: "image" | "video" | "raw";
  folder: string;
  tags?: string[];
  uploadedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const mediaAssetSchema = new Schema<IMediaAsset>(
  {
    url: { type: String, required: true },
    secureUrl: { type: String, required: true },
    publicId: { type: String, required: true, unique: true },
    altText: { type: String, trim: true },
    caption: { type: String, trim: true },
    width: { type: Number },
    height: { type: Number },
    format: { type: String, required: true },
    size: { type: Number, required: true },
    resourceType: {
      type: String,
      enum: ["image", "video", "raw"],
      default: "image",
    },
    folder: { type: String, required: true },
    tags: [{ type: String }],
    uploadedBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
  },
  { timestamps: true }
);

mediaAssetSchema.index({ publicId: 1 }, { unique: true });
mediaAssetSchema.index({ folder: 1, resourceType: 1 });
mediaAssetSchema.index({ tags: 1 });

export const MediaAsset: Model<IMediaAsset> =
  mongoose.models.MediaAsset ??
  mongoose.model<IMediaAsset>("MediaAsset", mediaAssetSchema);

// Re-export MediaObject type for convenience
export type { MediaObject };
