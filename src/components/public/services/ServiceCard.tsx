import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatDisplayTitle } from "@/lib/format-display-title";
import type { ServiceGroup } from "@/types/service";
import { getServiceGroupLabel } from "@/types/service";
import type { MediaObject } from "@/types/media";

export interface ServiceCardData {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  serviceGroup?: ServiceGroup;
  category?: string;
  featuredImage?: MediaObject;
  bulletPoints?: string[];
}

interface ServiceCardProps {
  service: ServiceCardData;
}

function resolveGroup(service: ServiceCardData): ServiceGroup {
  return service.serviceGroup === "agriculture" ? "agriculture" : "engineering";
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const group = resolveGroup(service);
  const groupLabel = getServiceGroupLabel(group);
  const badge = service.category?.trim() || groupLabel;
  const displayTitle = formatDisplayTitle(service.title);
  const highlights = (service.bulletPoints || []).filter(Boolean).slice(0, 3);
  const href = `/services/${service.slug}`;

  return (
    <article className="homepage-card-rise group relative flex h-full flex-col overflow-hidden rounded-3xl border border-emerald-900/10 bg-white shadow-[0_16px_40px_rgba(7,95,63,0.09)] ring-1 ring-white/80 transition-all duration-500 ease-out hover:-translate-y-2 hover:border-emerald-400/45 hover:bg-white hover:shadow-[0_28px_56px_rgba(7,95,63,0.16)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-1 origin-left scale-x-0 bg-gradient-to-r from-[#075f3f] via-[#0d8a5c] to-[#46a56c] transition-transform duration-500 group-hover:scale-x-100"
      />

      <div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-[#e8f5ef]">
        {service.featuredImage?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={service.featuredImage.url}
            alt={service.featuredImage.altText || displayTitle}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#063e2b] via-[#0a6d49] to-[#1a8f62]">
            <span className="text-4xl font-bold tracking-tight text-white/90">
              {(service.title || "U").slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[#021b14]/55 via-[#021b14]/10 to-transparent transition-opacity duration-500 group-hover:from-[#021b14]/65"
        />
        <span className="absolute left-4 top-4 inline-flex max-w-[calc(100%-2rem)] items-center rounded-full border border-white/20 bg-[#021b14]/45 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_8px_20px_rgba(0,0,0,0.2)] backdrop-blur-md">
          {badge}
        </span>
      </div>

      <div className="relative flex flex-1 flex-col p-6 sm:p-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#075f3f]/80">
          {group === "agriculture" ? "Agriculture" : "Engineering"}
        </p>
        <h3 className="mt-2 text-xl font-bold leading-snug tracking-tight text-[#0f172a] transition-colors duration-300 group-hover:text-[#075f3f] sm:text-[1.35rem]">
          <Link href={href} className="after:absolute after:inset-0 after:content-['']">
            {displayTitle}
          </Link>
        </h3>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
          {service.excerpt || "Learn more about this UESPAK service offering."}
        </p>

        {highlights.length ? (
          <ul className="mt-5 space-y-2.5 border-t border-emerald-900/[0.06] pt-5">
            {highlights.map((point, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                <span
                  aria-hidden
                  className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-bold text-[#075f3f] ring-1 ring-emerald-200/80"
                >
                  ✓
                </span>
                <span className="line-clamp-2 leading-snug">{point}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-5 flex-1 border-t border-emerald-900/[0.06] pt-5" />
        )}

        <div className="relative z-10 mt-6">
          <Link
            href={href}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-emerald-200/80 bg-[#f7fbf8] px-5 text-sm font-semibold text-[#075f3f] shadow-[0_4px_14px_rgba(7,95,63,0.08)] transition-all duration-300 group-hover:border-[#075f3f]/30 group-hover:bg-[#075f3f] group-hover:text-white group-hover:shadow-[0_10px_24px_rgba(7,95,63,0.22)] sm:w-auto"
          >
            Learn More
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      <Link
        href={href}
        aria-label={`Learn more about ${displayTitle}`}
        className="sr-only"
      >
        Learn more
      </Link>
    </article>
  );
}
