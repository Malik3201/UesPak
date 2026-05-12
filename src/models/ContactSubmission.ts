import mongoose, { Document, Model, Schema } from "mongoose";

export type ContactSubmissionStatus =
  | "new"
  | "read"
  | "replied"
  | "archived";

export interface IContactSubmission extends Document {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  serviceInterest?: string;
  message: string;
  consent?: boolean;
  status: ContactSubmissionStatus;
  source: string;
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
    company: { type: String, trim: true },
    subject: { type: String, required: true, trim: true },
    serviceInterest: { type: String, trim: true },
    message: { type: String, required: true },
    consent: { type: Boolean },
    status: {
      type: String,
      enum: ["new", "read", "replied", "archived"],
      default: "new",
    },
    source: { type: String, default: "contact-page", trim: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    repliedAt: { type: Date },
    repliedBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
  },
  { timestamps: true }
);

contactSubmissionSchema.index({ status: 1, createdAt: -1 });
contactSubmissionSchema.index({ email: 1 });
contactSubmissionSchema.index({ createdAt: -1 });

// IMPORTANT: Next.js dev/HMR may cache an older compiled schema instance and
// silently strip newly added fields (e.g. company, serviceInterest, source)
// on writes when strict mode is enabled. Force re-registration so the latest
// schema is always active.
if (mongoose.models.ContactSubmission) {
  mongoose.deleteModel("ContactSubmission");
}

export const ContactSubmission: Model<IContactSubmission> =
  mongoose.model<IContactSubmission>(
    "ContactSubmission",
    contactSubmissionSchema
  );
