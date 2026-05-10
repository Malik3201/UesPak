"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { HomePageContent } from "@/types/home-page";
import type { ProjectDto } from "@/types/project";
import { getProjectGroupLabel } from "@/types/project";

interface FeaturedProjectsSectionProps {
  section: HomePageContent["featuredProjects"];
  projects: ProjectDto[];
}

const MAX_CARDS = 9;

export default function FeaturedProjectsSection({
  section,
  projects,
}: FeaturedProjectsSectionProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const visibleProjects = useMemo(
    () => projects.slice(0, MAX_CARDS),
    [projects]
  );
  const enableCarousel = visibleProjects.length > 1;

  function getStep(track: HTMLDivElement) {
    const card = track.querySelector<HTMLElement>("[data-projects-card]");
    if (card?.offsetWidth) {
      return card.offsetWidth + 24;
    }
    return Math.max(track.clientWidth * 0.8, 240);
  }

  function scrollByDirection(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: getStep(track) * direction, behavior: "smooth" });
  }

  useEffect(() => {
    if (!enableCarousel || isPaused) return;
    const track = trackRef.current;
    if (!track) return;
    const id = window.setInterval(() => {
      const max = track.scrollWidth - track.clientWidth - 4;
      if (track.scrollLeft >= max) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        track.scrollBy({ left: getStep(track), behavior: "smooth" });
      }
    }, 5500);
    return () => window.clearInterval(id);
  }, [enableCarousel, isPaused, visibleProjects.length]);

  if (!visibleProjects.length) return null;

  const eyebrow = section.eyebrow?.trim() || "FEATURED PROJECTS";
  const title =
    section.title?.trim() || "Engineering, Agriculture & Automation Projects";
  const description =
    section.description?.trim() ||
    "Explore selected UESPAK projects across engineering, agriculture, facility systems, and industrial automation.";
  const bgUrl = section.backgroundImage?.url;
  const bgAlt =
    section.backgroundImage?.altText || "UESPAK featured projects background";

  return (
    <section className="featured-projects-fade-up relative isolate w-full overflow-hidden bg-[#063e2b] py-16 text-white sm:py-20 lg:py-24">
      {bgUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={bgUrl}
          alt={bgAlt}
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-50"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.14),transparent_42%),radial-gradient(circle_at_85%_25%,rgba(255,255,255,0.08),transparent_38%)]" />
      )}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(4,46,32,0.95)_0%,rgba(7,95,63,0.82)_55%,rgba(11,111,75,0.6)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:62px_62px] opacity-25"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-200/95">
              {eyebrow}
            </p>
            <h2 className="mt-3 text-balance text-3xl font-extrabold leading-tight tracking-tight text-white md:text-4xl xl:text-[2.75rem]">
              {title}
            </h2>
            {description ? (
              <p className="mt-4 text-sm leading-relaxed text-emerald-50/90 md:text-base">
                {description}
              </p>
            ) : null}
          </div>
          <Link
            href="/projects"
            className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            View all projects
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div
          className="group/carousel relative mt-10"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            ref={trackRef}
            className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-6 overflow-x-auto px-1 pb-4"
          >
            {visibleProjects.map((project, idx) => {
              const groupLabel = getProjectGroupLabel(
                project.projectGroup || "engineering"
              );
              const metaItems = [
                project.client,
                project.location,
                project.discipline,
              ]
                .filter((v): v is string => Boolean(v))
                .slice(0, 3);

              return (
                <article
                  key={project.id}
                  data-projects-card
                  style={{ animationDelay: `${280 + idx * 90}ms` }}
                  className="featured-projects-card group/card relative flex h-[480px] shrink-0 basis-full snap-start overflow-hidden rounded-3xl text-white shadow-[0_22px_48px_rgba(2,33,23,0.42)] transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_32px_70px_rgba(2,33,23,0.6)] sm:h-[520px] sm:basis-[calc((100%-1.5rem)/2)] lg:h-[540px] lg:basis-[calc((100%-3rem)/3)]"
                >
                  {project.featuredImage?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.featuredImage.url}
                      alt={project.featuredImage.altText || project.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
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
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,33,23,0.05)_0%,rgba(2,33,23,0.15)_38%,rgba(6,95,70,0.62)_70%,rgba(2,33,23,0.92)_100%)] transition-opacity duration-500 group-hover/card:opacity-100"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100 bg-[linear-gradient(180deg,rgba(2,33,23,0)_30%,rgba(2,33,23,0.18)_55%,rgba(2,33,23,0.35)_100%)]"
                  />

                  <div className="relative z-10 flex h-full w-full flex-col justify-between p-5 sm:p-6">
                    <span className="inline-flex w-fit items-center rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#075f3f] shadow-[0_8px_18px_rgba(2,33,23,0.3)] backdrop-blur-sm">
                      {groupLabel}
                    </span>

                    <div className="space-y-3">
                      <h3 className="text-balance text-xl font-bold leading-snug text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] sm:text-2xl">
                        {project.title}
                      </h3>
                      {project.excerpt ? (
                        <p className="line-clamp-2 text-sm leading-relaxed text-emerald-50/95 drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
                          {project.excerpt}
                        </p>
                      ) : null}
                      {metaItems.length ? (
                        <ul className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-emerald-100/90">
                          {metaItems.map((item, mIdx) => (
                            <li
                              key={`${project.id}-meta-${mIdx}`}
                              className="flex items-center gap-2"
                            >
                              {mIdx > 0 ? (
                                <span
                                  aria-hidden
                                  className="h-1 w-1 rounded-full bg-emerald-200/70"
                                />
                              ) : null}
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      <Link
                        href={`/projects/${project.slug}`}
                        aria-label={`View details for ${project.title}`}
                        className="group/cta mt-2 inline-flex h-11 w-fit items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#075f3f] shadow-[0_12px_24px_rgba(2,33,23,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-50"
                      >
                        View Details
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {enableCarousel ? (
            <>
              <button
                type="button"
                aria-label="Previous projects"
                onClick={() => scrollByDirection(-1)}
                className="absolute left-0 top-1/2 z-10 hidden h-12 w-12 -translate-x-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white text-[#075f3f] opacity-0 shadow-[0_14px_34px_rgba(2,33,23,0.22)] transition-all duration-300 hover:bg-emerald-50 hover:text-[#03452e] group-hover/carousel:-translate-x-14 group-hover/carousel:opacity-100 md:flex lg:-translate-x-12 lg:group-hover/carousel:-translate-x-20"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next projects"
                onClick={() => scrollByDirection(1)}
                className="absolute right-0 top-1/2 z-10 hidden h-12 w-12 translate-x-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white text-[#075f3f] opacity-0 shadow-[0_14px_34px_rgba(2,33,23,0.22)] transition-all duration-300 hover:bg-emerald-50 hover:text-[#03452e] group-hover/carousel:translate-x-14 group-hover/carousel:opacity-100 md:flex lg:translate-x-12 lg:group-hover/carousel:translate-x-20"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
