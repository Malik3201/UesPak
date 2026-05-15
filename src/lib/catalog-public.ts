import type { IProject } from "@/models/Project";
import type { IService } from "@/models/Service";
import type { ProjectCardData } from "@/components/public/projects/ProjectCard";
import type { ServiceCardData } from "@/components/public/services/ServiceCard";

export function toServiceCardData(service: IService): ServiceCardData {
  return {
    id: String(service._id),
    title: service.title,
    slug: service.slug,
    excerpt: service.excerpt,
    serviceGroup: service.serviceGroup,
    category: service.category,
    featuredImage: service.featuredImage,
    bulletPoints: service.bulletPoints || [],
  };
}

export function toProjectCardData(project: IProject): ProjectCardData {
  return {
    id: String(project._id),
    title: project.title,
    slug: project.slug,
    excerpt: project.excerpt,
    projectGroup: project.projectGroup,
    client: project.client,
    location: project.location,
    discipline: project.discipline,
    site: project.site,
    featuredImage: project.featuredImage,
  };
}
