import mongoose, { Document, Model, Schema } from "mongoose";
import type { RedirectStatusCode } from "@/types/redirect";

export interface IRedirect extends Document {
  fromPath: string;
  toPath: string;
  statusCode: RedirectStatusCode;
  isActive: boolean;
  notes?: string;
  hitCount: number;
  lastHitAt?: Date;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const REDIRECT_STATUS_CODES: RedirectStatusCode[] = [301, 302, 307, 308];

const redirectSchema = new Schema<IRedirect>(
  {
    fromPath: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: false,
    },
    toPath: { type: String, required: true, trim: true },
    statusCode: {
      type: Number,
      enum: REDIRECT_STATUS_CODES,
      default: 301,
    },
    isActive: { type: Boolean, default: true },
    notes: { type: String, trim: true, maxlength: 2000 },
    hitCount: { type: Number, default: 0, min: 0 },
    lastHitAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
  },
  { timestamps: true }
);

redirectSchema.index({ isActive: 1 });
redirectSchema.index({ fromPath: 1 }, { unique: true });

export const Redirect: Model<IRedirect> =
  mongoose.models.Redirect ?? mongoose.model<IRedirect>("Redirect", redirectSchema);
