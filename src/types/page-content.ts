import type { MediaObject } from "@/types/media";
import type { SeoData } from "@/types/seo";

export const PAGE_KEYS = ["about", "careers", "contact"] as const;
export type PageKey = (typeof PAGE_KEYS)[number];

export interface PageHero {
  eyebrow?: string;
  title?: string;
  description?: string;
  backgroundImage?: MediaObject;
  primaryButtonText?: string;
  primaryButtonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
}

export interface PageSimpleItem {
  title: string;
  description?: string;
  icon?: string;
  order?: number;
}

/** About page structured content. */
export interface AboutPageSections {
  overview: {
    eyebrow?: string;
    title?: string;
    description?: string;
    image?: MediaObject;
    highlights: string[];
    isActive: boolean;
  };
  story: {
    eyebrow?: string;
    title?: string;
    description?: string;
    image?: MediaObject;
    badgeImage?: MediaObject;
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
    values: PageSimpleItem[];
    isActive: boolean;
  };
  capabilities: {
    eyebrow?: string;
    title?: string;
    description?: string;
    items: PageSimpleItem[];
    isActive: boolean;
  };
  whyChoose: {
    eyebrow?: string;
    title?: string;
    description?: string;
    items: PageSimpleItem[];
    isActive: boolean;
  };
  cta: {
    eyebrow?: string;
    title?: string;
    description?: string;
    buttonText?: string;
    buttonUrl?: string;
    backgroundImage?: MediaObject;
    isActive: boolean;
  };
}

/** Careers page structured content. */
export interface CareersPageSections {
  intro: {
    eyebrow?: string;
    title?: string;
    description?: string;
    image?: MediaObject;
    isActive: boolean;
  };
  whyWork: {
    eyebrow?: string;
    title?: string;
    description?: string;
    items: PageSimpleItem[];
    isActive: boolean;
  };
  culture: {
    eyebrow?: string;
    title?: string;
    description?: string;
    values: PageSimpleItem[];
    isActive: boolean;
  };
  teamIntro: {
    eyebrow?: string;
    title?: string;
    description?: string;
    showTeamMembers: boolean;
    isActive: boolean;
  };
  applyCTA: {
    eyebrow?: string;
    title?: string;
    description?: string;
    buttonText?: string;
    buttonUrl?: string;
    email?: string;
    backgroundImage?: MediaObject;
    isActive: boolean;
  };
}

/** Contact page structured content. */
export interface ContactPageSections {
  info: {
    eyebrow?: string;
    title?: string;
    description?: string;
    phone?: string;
    email?: string;
    address?: string;
    workingHours?: string;
    isActive: boolean;
  };
  form: {
    eyebrow?: string;
    title?: string;
    description?: string;
    submitButtonText?: string;
    successMessage?: string;
    serviceOptions: string[];
    isActive: boolean;
  };
  map: {
    eyebrow?: string;
    title?: string;
    description?: string;
    /**
     * Override map embed URL. If not set, the site-wide `mapEmbedUrl` from
     * Site Settings is used. Empty/undefined here is the canonical "use
     * site settings" signal.
     */
    embedUrl?: string;
    isActive: boolean;
  };
  support: {
    eyebrow?: string;
    title?: string;
    description?: string;
    items: PageSimpleItem[];
    isActive: boolean;
  };
}

export interface BasePageContent<TSections> {
  pageKey: PageKey;
  title: string;
  slug: string;
  isActive: boolean;
  hero: PageHero;
  sections: TSections;
  seo: SeoData;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export type AboutPageContent = BasePageContent<AboutPageSections> & {
  pageKey: "about";
};
export type CareersPageContent = BasePageContent<CareersPageSections> & {
  pageKey: "careers";
};
export type ContactPageContent = BasePageContent<ContactPageSections> & {
  pageKey: "contact";
};

export type AnyPageContent =
  | AboutPageContent
  | CareersPageContent
  | ContactPageContent;
