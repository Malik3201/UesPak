import type { MediaObject } from "@/types/media";
import type { SeoData } from "@/types/seo";

export type TeamMemberStatus = "draft" | "published" | "archived";

export interface TeamMemberSocialLink {
  label: string;
  url: string;
}

export interface TeamMemberDto {
  id: string;
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
  socialLinks: TeamMemberSocialLink[];
  order: number;
  isFeatured: boolean;
  status: TeamMemberStatus;
  seo?: SeoData;
  publishedAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
