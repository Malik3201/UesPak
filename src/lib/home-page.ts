import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { HomePage } from "@/models/HomePage";
import { Service } from "@/models/Service";
import { Project } from "@/models/Project";
import { HOME_PAGE_KEY, getDefaultHomePageContent } from "@/constants/home-page";
import type { HomePageContent, PublicHomePageData } from "@/types/home-page";
import type { ServiceDto } from "@/types/service";
import type { ProjectDto } from "@/types/project";
import { getFeaturedProjects } from "@/lib/projects";
import { getFeaturedServices } from "@/lib/services";

function normalizeObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object") return {};
  return value as Record<string, unknown>;
}

function mergeDeep<T>(base: T, incoming: unknown): T {
  if (incoming == null) return base;
  if (Array.isArray(base) || Array.isArray(incoming)) {
    return (incoming as T) ?? base;
  }
  if (typeof base !== "object" || typeof incoming !== "object") {
    return (incoming as T) ?? base;
  }

  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, val] of Object.entries(incoming as Record<string, unknown>)) {
    const current = result[key];
    if (Array.isArray(val)) {
      result[key] = [...val];
    } else if (
      val &&
      typeof val === "object" &&
      current &&
      typeof current === "object" &&
      !Array.isArray(current)
    ) {
      result[key] = mergeDeep(current, val);
    } else {
      result[key] = val;
    }
  }
  return result as T;
}

function serializeServiceForHome(service: Record<string, unknown>): ServiceDto {
  return {
    id: String(service._id),
    title: String(service.title || ""),
    slug: String(service.slug || ""),
    excerpt: (service.excerpt as string | undefined) || undefined,
    content: (service.content as string | undefined) || undefined,
    serviceGroup:
      service.serviceGroup === "agriculture" ? "agriculture" : "engineering",
    category: (service.category as string | undefined) || undefined,
    icon: (service.icon as string | undefined) || undefined,
    featuredImage: service.featuredImage as ServiceDto["featuredImage"],
    gallery: (service.gallery as ServiceDto["gallery"]) || [],
    order: Number(service.order || 0),
    isFeatured: Boolean(service.isFeatured),
    status: (service.status as ServiceDto["status"]) || "draft",
    bulletPoints: (service.bulletPoints as string[]) || [],
    faqs: (service.faqs as ServiceDto["faqs"]) || [],
    cta: (service.cta as ServiceDto["cta"]) || { isActive: false },
    seo: service.seo as ServiceDto["seo"],
    publishedAt: service.publishedAt as string | Date | undefined,
    createdAt: service.createdAt as string | Date | undefined,
    updatedAt: service.updatedAt as string | Date | undefined,
  };
}

function serializeProjectForHome(project: Record<string, unknown>): ProjectDto {
  return {
    id: String(project._id),
    title: String(project.title || ""),
    slug: String(project.slug || ""),
    projectGroup:
      project.projectGroup === "agriculture"
        ? "agriculture"
        : project.projectGroup === "industrialAutomation"
          ? "industrialAutomation"
          : "engineering",
    categoryIds: ((project.categoryIds as unknown[]) || []).map((id) => String(id)),
    categoriesSnapshot:
      (project.categoriesSnapshot as ProjectDto["categoriesSnapshot"]) || [],
    excerpt: (project.excerpt as string | undefined) || undefined,
    description: (project.description as string | undefined) || undefined,
    content: (project.content as string | undefined) || undefined,
    status: (project.status as ProjectDto["status"]) || "draft",
    order: Number(project.order || 0),
    isFeatured: Boolean(project.isFeatured),
    site: (project.site as string | undefined) || undefined,
    client: (project.client as string | undefined) || undefined,
    location: (project.location as string | undefined) || undefined,
    discipline: (project.discipline as string | undefined) || undefined,
    commissioningDate:
      (project.commissioningDate as string | Date | undefined) || undefined,
    servicesProvided: (project.servicesProvided as string[]) || [],
    scope: (project.scope as string | undefined) || undefined,
    scopeItems: (project.scopeItems as string[]) || [],
    technologies: (project.technologies as string[]) || [],
    outcomes: (project.outcomes as string[]) || [],
    featuredImage: project.featuredImage as ProjectDto["featuredImage"],
    gallery: (project.gallery as ProjectDto["gallery"]) || [],
    linkedServices:
      ((project.linkedServices as unknown[]) || []).map((id) => String(id)),
    cta: (project.cta as ProjectDto["cta"]) || { isActive: false },
    seo: project.seo as ProjectDto["seo"],
    publishedAt: project.publishedAt as string | Date | undefined,
    createdAt: project.createdAt as string | Date | undefined,
    updatedAt: project.updatedAt as string | Date | undefined,
  };
}

export function getDefaultHomePage(): HomePageContent {
  return getDefaultHomePageContent();
}

export async function getHomePage(): Promise<{
  homePage: HomePageContent;
  persisted: boolean;
}> {
  const defaults = getDefaultHomePageContent();
  try {
    await connectDB();
    const doc = await HomePage.findOne({ key: HOME_PAGE_KEY }).lean();
    if (!doc) return { homePage: defaults, persisted: false };
    const merged = mergeDeep(defaults, normalizeObject(doc));
    merged.hero.backgroundImages = (merged.hero.backgroundImages || []).filter((item) =>
      Boolean(item?.url && (item?.publicId || item?.fileId))
    );
    merged.featuredServices.serviceIds = (merged.featuredServices.serviceIds || []).map((id) =>
      String(id)
    );
    merged.featuredProjects.projectIds = (merged.featuredProjects.projectIds || []).map((id) =>
      String(id)
    );
    return { homePage: merged, persisted: true };
  } catch {
    return { homePage: defaults, persisted: false };
  }
}

export async function getPublicHomePage(): Promise<PublicHomePageData> {
  const { homePage } = await getHomePage();
  const serviceIds = homePage.featuredServices.serviceIds || [];
  const projectIds = homePage.featuredProjects.projectIds || [];

  let featuredServicesResolved: ServiceDto[] = [];
  let featuredProjectsResolved: ProjectDto[] = [];

  try {
    await connectDB();
    if (serviceIds.length) {
      const ids = serviceIds
        .filter((id) => mongoose.isValidObjectId(id))
        .map((id) => new mongoose.Types.ObjectId(id));
      const docs = await Service.find({
        _id: { $in: ids },
        status: "published",
      })
        .sort({ order: 1, createdAt: -1 })
        .lean();
      featuredServicesResolved = docs.map((s) =>
        serializeServiceForHome(s as unknown as Record<string, unknown>)
      );
    } else {
      const fallback = await getFeaturedServices();
      featuredServicesResolved = fallback.map((s) =>
        serializeServiceForHome(s as unknown as Record<string, unknown>)
      );
    }
  } catch {
    featuredServicesResolved = [];
  }

  try {
    await connectDB();
    if (projectIds.length) {
      const ids = projectIds
        .filter((id) => mongoose.isValidObjectId(id))
        .map((id) => new mongoose.Types.ObjectId(id));
      const docs = await Project.find({
        _id: { $in: ids },
        status: "published",
      })
        .sort({ order: 1, createdAt: -1 })
        .lean();
      featuredProjectsResolved = docs.map((p) =>
        serializeProjectForHome(p as unknown as Record<string, unknown>)
      );
    } else {
      const fallback = await getFeaturedProjects();
      featuredProjectsResolved = fallback.map((p) =>
        serializeProjectForHome(p as unknown as Record<string, unknown>)
      );
    }
  } catch {
    featuredProjectsResolved = [];
  }

  return {
    ...homePage,
    featuredServicesResolved,
    featuredProjectsResolved,
  };
}

