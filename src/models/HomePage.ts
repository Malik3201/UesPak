import mongoose, { Document, Model, Schema } from "mongoose";
import type { MediaObject } from "@/types/media";
import type { SeoData } from "@/types/seo";
import type { HomePageStatus } from "@/types/home-page";
import { HOME_PAGE_KEY } from "@/constants/home-page";

export interface IHomePage extends Document {
  key: string;
  status: HomePageStatus;
  hero: {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    description?: string;
    primaryButtonText?: string;
    primaryButtonUrl?: string;
    secondaryButtonText?: string;
    secondaryButtonUrl?: string;
    backgroundImage?: MediaObject;
    foregroundImage?: MediaObject;
    badges: string[];
    isActive: boolean;
  };
  featuredServices: {
    title?: string;
    subtitle?: string;
    description?: string;
    serviceIds: mongoose.Types.ObjectId[];
    isActive: boolean;
  };
  servicesOverview: {
    eyebrow?: string;
    title?: string;
    description?: string;
    image?: MediaObject;
    isActive: boolean;
  };
  whyChooseUs: {
    eyebrow?: string;
    title?: string;
    description?: string;
    items: Array<{ title: string; description?: string; icon?: string; order?: number }>;
    isActive: boolean;
  };
  aboutPreview: {
    eyebrow?: string;
    title?: string;
    description?: string;
    image?: MediaObject;
    buttonText?: string;
    buttonUrl?: string;
    isActive: boolean;
  };
  visionMission: {
    eyebrow?: string;
    title?: string;
    visionTitle?: string;
    visionDescription?: string;
    missionTitle?: string;
    missionDescription?: string;
    valuesTitle?: string;
    valuesDescription?: string;
    image?: MediaObject;
    isActive: boolean;
  };
  stats: {
    title?: string;
    description?: string;
    items: Array<{
      label: string;
      value: string;
      suffix?: string;
      description?: string;
      order?: number;
    }>;
    isActive: boolean;
  };
  featuredProjects: {
    title?: string;
    subtitle?: string;
    description?: string;
    projectIds: mongoose.Types.ObjectId[];
    isActive: boolean;
  };
  industries: {
    title?: string;
    description?: string;
    items: Array<{ name: string; description?: string; icon?: string; order?: number }>;
    isActive: boolean;
  };
  teamPreview: {
    title?: string;
    description?: string;
    isActive: boolean;
  };
  clients: {
    title?: string;
    description?: string;
    logos: Array<{ name: string; logo?: MediaObject; url?: string; order?: number }>;
    isActive: boolean;
  };
  profileCTA: {
    eyebrow?: string;
    title?: string;
    description?: string;
    buttonText?: string;
    isActive: boolean;
  };
  contactCTA: {
    eyebrow?: string;
    title?: string;
    description?: string;
    buttonText?: string;
    buttonUrl?: string;
    isActive: boolean;
  };
  seo?: SeoData;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const mediaSchema = new Schema<MediaObject>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    fileId: { type: String, trim: true },
    altText: { type: String, trim: true },
    width: { type: Number },
    height: { type: Number },
    format: { type: String, trim: true },
    size: { type: Number },
  },
  { _id: false }
);

const seoSchema = new Schema<SeoData>(
  {
    metaTitle: { type: String, trim: true, maxlength: 70 },
    metaDescription: { type: String, trim: true, maxlength: 180 },
    keywords: [{ type: String, trim: true }],
    canonicalUrl: { type: String, trim: true },
    ogTitle: { type: String, trim: true },
    ogDescription: { type: String, trim: true },
    ogImage: mediaSchema,
    robots: {
      index: { type: Boolean, default: true },
      follow: { type: Boolean, default: true },
    },
    schemaType: { type: String, trim: true, default: "WebSite" },
  },
  { _id: false }
);

const homePageSchema = new Schema<IHomePage>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: HOME_PAGE_KEY,
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
    hero: {
      type: new Schema(
        {
          eyebrow: { type: String, trim: true },
          title: { type: String, trim: true },
          subtitle: { type: String, trim: true },
          description: { type: String, trim: true },
          primaryButtonText: { type: String, trim: true },
          primaryButtonUrl: { type: String, trim: true },
          secondaryButtonText: { type: String, trim: true },
          secondaryButtonUrl: { type: String, trim: true },
          backgroundImage: mediaSchema,
          foregroundImage: mediaSchema,
          badges: { type: [{ type: String, trim: true }], default: [] },
          isActive: { type: Boolean, default: true },
        },
        { _id: false }
      ),
      default: { isActive: true, badges: [] },
    },
    featuredServices: {
      type: new Schema(
        {
          title: { type: String, trim: true },
          subtitle: { type: String, trim: true },
          description: { type: String, trim: true },
          serviceIds: { type: [{ type: Schema.Types.ObjectId, ref: "Service" }], default: [] },
          isActive: { type: Boolean, default: true },
        },
        { _id: false }
      ),
      default: { isActive: true, serviceIds: [] },
    },
    servicesOverview: {
      type: new Schema(
        {
          eyebrow: { type: String, trim: true },
          title: { type: String, trim: true },
          description: { type: String, trim: true },
          image: mediaSchema,
          isActive: { type: Boolean, default: true },
        },
        { _id: false }
      ),
      default: { isActive: true },
    },
    whyChooseUs: {
      type: new Schema(
        {
          eyebrow: { type: String, trim: true },
          title: { type: String, trim: true },
          description: { type: String, trim: true },
          items: {
            type: [
              new Schema(
                {
                  title: { type: String, required: true, trim: true },
                  description: { type: String, trim: true },
                  icon: { type: String, trim: true },
                  order: { type: Number, default: 0 },
                },
                { _id: false }
              ),
            ],
            default: [],
          },
          isActive: { type: Boolean, default: true },
        },
        { _id: false }
      ),
      default: { isActive: true, items: [] },
    },
    aboutPreview: {
      type: new Schema(
        {
          eyebrow: { type: String, trim: true },
          title: { type: String, trim: true },
          description: { type: String, trim: true },
          image: mediaSchema,
          buttonText: { type: String, trim: true },
          buttonUrl: { type: String, trim: true },
          isActive: { type: Boolean, default: true },
        },
        { _id: false }
      ),
      default: { isActive: true },
    },
    visionMission: {
      type: new Schema(
        {
          eyebrow: { type: String, trim: true },
          title: { type: String, trim: true },
          visionTitle: { type: String, trim: true },
          visionDescription: { type: String, trim: true },
          missionTitle: { type: String, trim: true },
          missionDescription: { type: String, trim: true },
          valuesTitle: { type: String, trim: true },
          valuesDescription: { type: String, trim: true },
          image: mediaSchema,
          isActive: { type: Boolean, default: true },
        },
        { _id: false }
      ),
      default: { isActive: true },
    },
    stats: {
      type: new Schema(
        {
          title: { type: String, trim: true },
          description: { type: String, trim: true },
          items: {
            type: [
              new Schema(
                {
                  label: { type: String, required: true, trim: true },
                  value: { type: String, required: true, trim: true },
                  suffix: { type: String, trim: true },
                  description: { type: String, trim: true },
                  order: { type: Number, default: 0 },
                },
                { _id: false }
              ),
            ],
            default: [],
          },
          isActive: { type: Boolean, default: true },
        },
        { _id: false }
      ),
      default: { isActive: true, items: [] },
    },
    featuredProjects: {
      type: new Schema(
        {
          title: { type: String, trim: true },
          subtitle: { type: String, trim: true },
          description: { type: String, trim: true },
          projectIds: { type: [{ type: Schema.Types.ObjectId, ref: "Project" }], default: [] },
          isActive: { type: Boolean, default: true },
        },
        { _id: false }
      ),
      default: { isActive: true, projectIds: [] },
    },
    industries: {
      type: new Schema(
        {
          title: { type: String, trim: true },
          description: { type: String, trim: true },
          items: {
            type: [
              new Schema(
                {
                  name: { type: String, required: true, trim: true },
                  description: { type: String, trim: true },
                  icon: { type: String, trim: true },
                  order: { type: Number, default: 0 },
                },
                { _id: false }
              ),
            ],
            default: [],
          },
          isActive: { type: Boolean, default: true },
        },
        { _id: false }
      ),
      default: { isActive: true, items: [] },
    },
    teamPreview: {
      type: new Schema(
        {
          title: { type: String, trim: true },
          description: { type: String, trim: true },
          isActive: { type: Boolean, default: true },
        },
        { _id: false }
      ),
      default: { isActive: true },
    },
    clients: {
      type: new Schema(
        {
          title: { type: String, trim: true },
          description: { type: String, trim: true },
          logos: {
            type: [
              new Schema(
                {
                  name: { type: String, required: true, trim: true },
                  logo: mediaSchema,
                  url: { type: String, trim: true },
                  order: { type: Number, default: 0 },
                },
                { _id: false }
              ),
            ],
            default: [],
          },
          isActive: { type: Boolean, default: true },
        },
        { _id: false }
      ),
      default: { isActive: true, logos: [] },
    },
    profileCTA: {
      type: new Schema(
        {
          eyebrow: { type: String, trim: true },
          title: { type: String, trim: true },
          description: { type: String, trim: true },
          buttonText: { type: String, trim: true },
          isActive: { type: Boolean, default: true },
        },
        { _id: false }
      ),
      default: { isActive: true },
    },
    contactCTA: {
      type: new Schema(
        {
          eyebrow: { type: String, trim: true },
          title: { type: String, trim: true },
          description: { type: String, trim: true },
          buttonText: { type: String, trim: true },
          buttonUrl: { type: String, trim: true },
          isActive: { type: Boolean, default: true },
        },
        { _id: false }
      ),
      default: { isActive: true },
    },
    seo: seoSchema,
    createdBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
  },
  { timestamps: true }
);

homePageSchema.index({ status: 1 });
homePageSchema.index({ createdAt: -1 });

export const HomePage: Model<IHomePage> =
  mongoose.models.HomePage ?? mongoose.model<IHomePage>("HomePage", homePageSchema);

