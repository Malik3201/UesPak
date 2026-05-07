import type { MediaObject } from "@/types/media";
import type { SeoData } from "@/types/seo";

export type ServiceStatus = "draft" | "published" | "archived";

export type ServiceGroup = "engineering" | "agriculture";

export const SERVICE_GROUPS = [
  { value: "engineering", label: "Engineering Services" },
  { value: "agriculture", label: "Agriculture Services" },
] as const;

export function getServiceGroupLabel(group: ServiceGroup): string {
  return group === "agriculture" ? "Agriculture Services" : "Engineering Services";
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface ServiceCta {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string;
  isActive: boolean;
}

export interface ServiceDto {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  serviceGroup?: ServiceGroup;
  category?: string;
  icon?: string;
  featuredImage?: MediaObject;
  gallery: MediaObject[];
  order: number;
  isFeatured: boolean;
  status: ServiceStatus;
  bulletPoints: string[];
  faqs: ServiceFaq[];
  cta: ServiceCta;
  seo?: SeoData;
  publishedAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
