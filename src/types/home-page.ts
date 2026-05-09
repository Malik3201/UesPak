import type { MediaObject } from "@/types/media";
import type { SeoData } from "@/types/seo";
import type { ProjectDto } from "@/types/project";
import type { ServiceDto } from "@/types/service";

export type HomePageStatus = "draft" | "published";

export interface HomePageSimpleItem {
  title: string;
  description?: string;
  icon?: string;
  order?: number;
}

export interface HomePageStatItem {
  label: string;
  value: string;
  suffix?: string;
  description?: string;
  order?: number;
}

export interface HomePageClientLogo {
  name: string;
  logo?: MediaObject;
  url?: string;
  order?: number;
}

export interface HomePageContent {
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
    backgroundImages?: MediaObject[];
    foregroundImage?: MediaObject;
    badges: string[];
    isActive: boolean;
  };
  featuredServices: {
    title?: string;
    subtitle?: string;
    description?: string;
    serviceIds: string[];
    backgroundImage?: MediaObject;
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
    items: HomePageSimpleItem[];
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
    items: HomePageStatItem[];
    isActive: boolean;
  };
  featuredProjects: {
    title?: string;
    subtitle?: string;
    description?: string;
    projectIds: string[];
    isActive: boolean;
  };
  industries: {
    title?: string;
    description?: string;
    items: Array<{
      name: string;
      description?: string;
      icon?: string;
      order?: number;
    }>;
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
    logos: HomePageClientLogo[];
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
  seo: SeoData;
}

export interface PublicHomePageData extends HomePageContent {
  featuredServicesResolved: ServiceDto[];
  featuredProjectsResolved: ProjectDto[];
}

