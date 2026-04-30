import mongoose, { Document, Model, Schema } from "mongoose";

export interface IRedirect extends Document {
  source: string;
  destination: string;
  permanent: boolean;
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const redirectSchema = new Schema<IRedirect>(
  {
    source: { type: String, required: true, unique: true, trim: true },
    destination: { type: String, required: true, trim: true },
    permanent: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
  },
  { timestamps: true }
);

redirectSchema.index({ source: 1 }, { unique: true });
redirectSchema.index({ isActive: 1 });

export const Redirect: Model<IRedirect> =
  mongoose.models.Redirect ??
  mongoose.model<IRedirect>("Redirect", redirectSchema);
