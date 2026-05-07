import type { MediaObject } from "@/types/media";
import type { SeoData } from "@/types/seo";

export type ProjectGroup = "engineering" | "agriculture" | "industrialAutomation";
export type ProjectStatus = "draft" | "published" | "archived";
export type ProjectCategoryStatus = "active" | "inactive" | "archived";

export const PROJECT_GROUPS = [
  { value: "engineering", label: "Engineering Projects", slug: "engineering" },
  { value: "agriculture", label: "Agriculture Projects", slug: "agriculture" },
  {
    value: "industrialAutomation",
    label: "Industrial Automation",
    slug: "industrial-automation",
  },
] as const;

export function getProjectGroupLabel(group: ProjectGroup): string {
  if (group === "agriculture") return "Agriculture Projects";
  if (group === "industrialAutomation") return "Industrial Automation";
  return "Engineering Projects";
}

export function getProjectGroupFromSlug(slug: string): ProjectGroup | null {
  if (slug === "engineering") return "engineering";
  if (slug === "agriculture") return "agriculture";
  if (slug === "industrial-automation") return "industrialAutomation";
  return null;
}

export function getProjectGroupSlug(group: ProjectGroup): string {
  return PROJECT_GROUPS.find((g) => g.value === group)?.slug || "engineering";
}

export interface ProjectCategoryDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  projectGroup?: ProjectGroup;
  order: number;
  status: ProjectCategoryStatus;
  seo?: SeoData;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ProjectCategorySnapshot {
  id?: string;
  name: string;
  slug: string;
}

export interface ProjectCta {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string;
  isActive: boolean;
}

export interface ProjectDto {
  id: string;
  title: string;
  slug: string;
  projectGroup?: ProjectGroup;
  categoryIds: string[];
  categoriesSnapshot?: ProjectCategorySnapshot[];
  excerpt?: string;
  description?: string;
  content?: string;
  status: ProjectStatus;
  order: number;
  isFeatured: boolean;
  site?: string;
  client?: string;
  location?: string;
  discipline?: string;
  commissioningDate?: string | Date;
  servicesProvided: string[];
  scope?: string;
  scopeItems: string[];
  technologies: string[];
  outcomes: string[];
  featuredImage?: MediaObject;
  gallery: MediaObject[];
  linkedServices: string[];
  cta: ProjectCta;
  seo?: SeoData;
  publishedAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

