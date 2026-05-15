import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ProjectGroup } from "@/types/project";
import { getProjectGroupLabel } from "@/types/project";
import type { MediaObject } from "@/types/media";

export interface ProjectCardData {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  projectGroup?: ProjectGroup;
  client?: string;
  location?: string;
  discipline?: string;
  site?: string;
  featuredImage?: MediaObject;
}

interface ProjectCardProps {
  project: ProjectCardData;
  className?: string;
}

export default function ProjectCard({ project, className }: ProjectCardProps) {
  const group = project.projectGroup || "engineering";
  const groupLabel = getProjectGroupLabel(group);
  const metaItems = [project.client, project.location, project.discipline]
    .filter((v): v is string => Boolean(v))
    .slice(0, 3);

  return (
    <article
      className={`homepage-card-rise group relative flex min-h-[420px] flex-col overflow-hidden rounded-3xl text-white shadow-[0_22px_48px_rgba(2,33,23,0.28)] transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_32px_70px_rgba(2,33,23,0.45)] sm:min-h-[460px] ${className || ""}`}
    >
      {project.featuredImage?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.featuredImage.url}
          alt={project.featuredImage.altText || project.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-[#0a6d49] via-[#0f7a54] to-[#46a56c]">
          <span className="text-4xl font-bold tracking-tight text-white/90">
            {(project.title || "U").slice(0, 2).toUpperCase()}
          </span>
        </div>
      )}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,33,23,0.05)_0%,rgba(2,33,23,0.15)_38%,rgba(6,95,70,0.62)_70%,rgba(2,33,23,0.92)_100%)]"
      />

      <div className="relative z-10 flex h-full min-h-[420px] flex-col justify-between p-5 sm:min-h-[460px] sm:p-6">
        <span className="inline-flex w-fit items-center rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#075f3f] shadow-[0_8px_18px_rgba(2,33,23,0.3)]">
          {groupLabel}
        </span>

        <div className="space-y-3">
          <h3 className="text-balance text-xl font-bold leading-snug text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] sm:text-2xl">
            {project.title}
          </h3>
          {project.excerpt ? (
            <p className="line-clamp-2 text-sm leading-relaxed text-emerald-50/95">
              {project.excerpt}
            </p>
          ) : null}
          {metaItems.length ? (
            <ul className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-emerald-100/90">
              {metaItems.map((item, mIdx) => (
                <li key={`${project.id}-meta-${mIdx}`} className="flex items-center gap-2">
                  {mIdx > 0 ? (
                    <span aria-hidden className="h-1 w-1 rounded-full bg-emerald-200/70" />
                  ) : null}
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <Link
            href={`/projects/${project.slug}`}
            className="group/cta mt-2 inline-flex h-11 w-fit items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#075f3f] shadow-[0_12px_24px_rgba(2,33,23,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-50"
          >
            View Details
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}
