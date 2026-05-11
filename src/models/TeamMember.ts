import mongoose, { Document, Model, Schema } from "mongoose";
import type { MediaObject } from "@/types/media";
import type { SeoData } from "@/types/seo";

export type TeamMemberStatus = "draft" | "published" | "archived";

export interface ITeamMemberSocialLink {
  label: string;
  url: string;
}

export interface ITeamMember extends Document {
  name: string;
  slug: string;
  designation: string;
  department?: string;
  shortBio?: string;
  bio?: string;
  expertise: string[];
  qualifications: string[];
  experienceYears?: number;
  image?: MediaObject;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  socialLinks: ITeamMemberSocialLink[];
  order: number;
  isFeatured: boolean;
  status: TeamMemberStatus;
  seo?: SeoData;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const socialLinkSchema = new Schema<ITeamMemberSocialLink>(
  {
    label: { type: String, trim: true, required: true },
    url: { type: String, trim: true, required: true },
  },
  { _id: false }
);

const mediaObjectSchema = new Schema<MediaObject>(
  {
    url: { type: String, required: true, trim: true },
    publicId: { type: String, trim: true, default: "" },
    fileId: { type: String, trim: true },
    altText: { type: String, trim: true, default: "" },
    width: { type: Number },
    height: { type: Number },
    format: { type: String, trim: true },
    size: { type: Number },
    mimeType: { type: String, trim: true },
  },
  { _id: false }
);

const seoSchema = new Schema<SeoData>(
  {
    metaTitle: { type: String, trim: true, maxlength: 70, default: "" },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: 180,
      default: "",
    },
    keywords: { type: [String], default: [] },
    canonicalUrl: { type: String, trim: true, default: "" },
    ogTitle: { type: String, trim: true, default: "" },
    ogDescription: { type: String, trim: true, maxlength: 180, default: "" },
    ogImage: mediaObjectSchema,
    robots: {
      index: { type: Boolean, default: true },
      follow: { type: Boolean, default: true },
    },
    schemaType: { type: String, trim: true, default: "Person" },
  },
  { _id: false }
);

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
    designation: { type: String, required: true, trim: true },
    department: { type: String, trim: true },
    shortBio: { type: String, trim: true, maxlength: 400 },
    bio: { type: String },
    expertise: { type: [String], default: [] },
    qualifications: { type: [String], default: [] },
    experienceYears: { type: Number },
    image: mediaObjectSchema,
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    linkedinUrl: { type: String, trim: true },
    socialLinks: { type: [socialLinkSchema], default: [] },
    order: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    seo: seoSchema,
    createdBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

teamMemberSchema.index({ slug: 1 }, { unique: true });
teamMemberSchema.index({ status: 1 });
teamMemberSchema.index({ isFeatured: 1 });
teamMemberSchema.index({ order: 1 });
teamMemberSchema.index({ department: 1 });
teamMemberSchema.index({ createdAt: -1 });

// Force re-registration to avoid stale HMR schema in Next.js dev.
if (mongoose.models.TeamMember) {
  mongoose.deleteModel("TeamMember");
}

export const TeamMember: Model<ITeamMember> = mongoose.model<ITeamMember>(
  "TeamMember",
  teamMemberSchema
);
