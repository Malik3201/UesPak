"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Container from "@/components/shared/Container";
import { getServiceGroupLabel } from "@/types/service";
import type { ServiceDto } from "@/types/service";
import type { HomePageContent } from "@/types/home-page";

interface FeaturedServicesSectionProps {
  section: HomePageContent["featuredServices"];
  services: ServiceDto[];
}

const MAX_CARDS = 9;

export default function FeaturedServicesSection({
  section,
  services,
}: FeaturedServicesSectionProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const visibleServices = useMemo(
    () => services.slice(0, MAX_CARDS),
    [services]
  );
  const enableCarousel = visibleServices.length > 1;

  function getStep(track: HTMLDivElement) {
    const card = track.querySelector<HTMLElement>("[data-services-card]");
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
    }, 5000);
    return () => window.clearInterval(id);
  }, [enableCarousel, isPaused, visibleServices.length]);

  if (!visibleServices.length) return null;

  const eyebrow =
    section.subtitle?.trim() || "What We Offer";
  const title = section.title?.trim() || "Our Services";
  const description = section.description?.trim();
  const bgUrl = section.backgroundImage?.url;
  const bgAlt =
    section.backgroundImage?.altText || "UESPAK services background";

  return (
    <section className="relative isolate overflow-hidden bg-[#063e2b] py-20 text-white lg:py-28">
      {bgUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={bgUrl}
          alt={bgAlt}
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-45"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.12),transparent_42%),radial-gradient(circle_at_85%_25%,rgba(255,255,255,0.08),transparent_38%)]" />
      )}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(4,46,32,0.92)_0%,rgba(7,95,63,0.78)_55%,rgba(11,111,75,0.55)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:62px_62px] opacity-25" />

      <Container className="space-y-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/90">
              {eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-white md:text-4xl xl:text-5xl">
              {title}
            </h2>
            {description ? (
              <p className="mt-4 text-sm leading-relaxed text-emerald-50/90 md:text-base">
                {description}
              </p>
            ) : null}
          </div>
          <Link
            href="/services"
            className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            View all services
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div
          className="group/carousel relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            ref={trackRef}
            className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-6 overflow-x-auto px-1 pb-4"
          >
            {visibleServices.map((service) => (
              <article
                key={service.id}
                data-services-card
                className="group/card relative flex shrink-0 basis-full flex-col overflow-hidden rounded-2xl bg-white text-slate-900 shadow-[0_18px_42px_rgba(2,33,23,0.28)] ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(2,33,23,0.35)] sm:basis-[calc((100%-1.5rem)/2)] lg:basis-[calc((100%-3rem)/3)]"
              >
                <div className="relative h-56 w-full overflow-hidden">
                  {service.featuredImage?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={service.featuredImage.url}
                      alt={service.featuredImage.altText || service.title}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-gradient-to-br from-[#0a6d49] via-[#0f7a54] to-[#46a56c]">
                      <span className="text-3xl font-bold tracking-tight text-white/90">
                        {(service.title || "U").slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                </div>

                <div className="flex flex-1 flex-col gap-3 p-6">
                  <p className="inline-flex w-fit rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#075f3f]">
                    {getServiceGroupLabel(service.serviceGroup || "engineering")}
                  </p>
                  <h3 className="text-lg font-semibold leading-snug text-[#0f1f17]">
                    {service.title}
                  </h3>
                  <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">
                    {service.excerpt || "Explore this service by UESPAK."}
                  </p>
                  <div className="mt-auto pt-2">
                    <Link
                      href={`/services/${service.slug}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-[#075f3f] transition-colors hover:text-[#03452e]"
                    >
                      Learn More
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/card:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {enableCarousel ? (
            <>
              <button
                type="button"
                aria-label="Previous services"
                onClick={() => scrollByDirection(-1)}
                className="absolute left-0 top-1/2 z-10 hidden h-12 w-12 -translate-x-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white text-[#075f3f] opacity-0 shadow-[0_14px_34px_rgba(2,33,23,0.22)] transition-all duration-300 hover:bg-emerald-50 hover:text-[#03452e] group-hover/carousel:-translate-x-14 group-hover/carousel:opacity-100 md:flex lg:-translate-x-12 lg:group-hover/carousel:-translate-x-20"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next services"
                onClick={() => scrollByDirection(1)}
                className="absolute right-0 top-1/2 z-10 hidden h-12 w-12 translate-x-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white text-[#075f3f] opacity-0 shadow-[0_14px_34px_rgba(2,33,23,0.22)] transition-all duration-300 hover:bg-emerald-50 hover:text-[#03452e] group-hover/carousel:translate-x-14 group-hover/carousel:opacity-100 md:flex lg:translate-x-12 lg:group-hover/carousel:translate-x-20"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
