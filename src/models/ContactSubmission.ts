import mongoose, { Document, Model, Schema } from "mongoose";

export interface IContactSubmission extends Document {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  ipAddress?: string;
  userAgent?: string;
  repliedAt?: Date;
  repliedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const contactSubmissionSchema = new Schema<IContactSubmission>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["new", "read", "replied", "archived"],
      default: "new",
    },
    ipAddress: { type: String },
    userAgent: { type: String },
    repliedAt: { type: Date },
    repliedBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
  },
  { timestamps: true }
);

contactSubmissionSchema.index({ status: 1, createdAt: -1 });
contactSubmissionSchema.index({ email: 1 });

export const ContactSubmission: Model<IContactSubmission> =
  mongoose.models.ContactSubmission ??
  mongoose.model<IContactSubmission>(
    "ContactSubmission",
    contactSubmissionSchema
  );
