import type { MediaObject } from "@/types/media";

// ─── SEO subdocument ──────────────────────────────────────────────────────────
export interface SeoData {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string | MediaObject;
  robots?: {
    index: boolean;
    follow: boolean;
  };
  schemaType?: string;
}

// ─── JSON-LD schema types ─────────────────────────────────────────────────────
export type SchemaType =
  | "Organization"
  | "WebPage"
  | "Article"
  | "Service"
  | "FAQPage"
  | "BreadcrumbList";
