import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
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
  const highlights = (service.bulletPoints || []).filter(Boolean).slice(0, 3);

  return (
    <article className="homepage-card-rise group flex h-full flex-col overflow-hidden rounded-2xl border border-emerald-900/8 bg-white shadow-[0_14px_32px_rgba(7,95,63,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-400/60 hover:shadow-[0_24px_48px_rgba(7,95,63,0.16)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#e8f5ef]">
        {service.featuredImage?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={service.featuredImage.url}
            alt={service.featuredImage.altText || service.title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0a6d49] via-[#0f7a54] to-[#46a56c]">
            <span className="text-3xl font-bold text-white/90">
              {(service.title || "U").slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        <span className="absolute left-4 top-4 inline-flex rounded-full bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#075f3f] shadow-sm">
          {service.category?.trim() || groupLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="text-lg font-bold leading-snug text-[#0f172a] transition-colors group-hover:text-[#075f3f]">
          {service.title}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
          {service.excerpt || "Learn more about this UESPAK service offering."}
        </p>

        {highlights.length ? (
          <ul className="mt-4 space-y-2">
            {highlights.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#075f3f]" aria-hidden />
                <span className="line-clamp-2">{point}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <Link
          href={`/services/${service.slug}`}
          className="group/cta mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#075f3f]"
        >
          Learn More
          <ArrowRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
