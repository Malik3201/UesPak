import mongoose, { Document, Model, Schema } from "mongoose";
import { mediaSchema } from "./AdminUser";
import type { MediaObject } from "@/types/media";

export interface ITeamMember extends Document {
  name: string;
  slug: string;
  designation?: string;
  bio?: string;
  photo?: MediaObject;
  email?: string;
  linkedIn?: string;
  order: number;
  status: "active" | "inactive";
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const teamMemberSchema = new Schema<ITeamMember>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    designation: { type: String, trim: true },
    bio: { type: String },
    photo: mediaSchema,
    email: { type: String, lowercase: true, trim: true },
    linkedIn: { type: String, trim: true },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    createdBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
  },
  { timestamps: true }
);

teamMemberSchema.index({ slug: 1 }, { unique: true });
teamMemberSchema.index({ status: 1, order: 1 });

export const TeamMember: Model<ITeamMember> =
  mongoose.models.TeamMember ??
  mongoose.model<ITeamMember>("TeamMember", teamMemberSchema);
