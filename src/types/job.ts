import type { SeoData } from "@/types/seo";

export type JobStatus = "draft" | "published" | "archived";

export type JobType =
  | "full-time"
  | "part-time"
  | "contract"
  | "internship"
  | "remote";

export type JobWorkMode = "on-site" | "hybrid" | "remote";

export type JobExperienceLevel =
  | "entry"
  | "mid"
  | "senior"
  | "lead"
  | "internship";

export interface JobDto {
  id?: string;
  title: string;
  slug: string;
  department?: string;
  location?: string;
  jobType: JobType;
  workMode: JobWorkMode;
  experienceLevel: JobExperienceLevel;
  experienceRequired?: string;
  shortDescription?: string;
  description?: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  skills: string[];
  applyEmail?: string;
  applyUrl?: string;
  applicationInstructions?: string;
  deadline?: string;
  status: JobStatus;
  isFeatured: boolean;
  order: number;
  seo?: SeoData;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobCardData {
  id: string;
  title: string;
  slug: string;
  department?: string;
  location?: string;
  jobType: JobType;
  workMode: JobWorkMode;
  experienceLevel: JobExperienceLevel;
  experienceRequired?: string;
  shortDescription?: string;
  isFeatured: boolean;
  applyEmail?: string;
  applyUrl?: string;
  deadline?: string;
}

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
  remote: "Remote",
};

export const JOB_WORK_MODE_LABELS: Record<JobWorkMode, string> = {
  "on-site": "On-site",
  hybrid: "Hybrid",
  remote: "Remote",
};

export const JOB_EXPERIENCE_LABELS: Record<JobExperienceLevel, string> = {
  entry: "Entry level",
  mid: "Mid level",
  senior: "Senior",
  lead: "Lead",
  internship: "Internship",
};
