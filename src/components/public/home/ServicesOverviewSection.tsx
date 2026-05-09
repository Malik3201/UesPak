import Link from "next/link";
import {
  ArrowRight,
  Check,
  Leaf,
  Settings2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { HomePageContent } from "@/types/home-page";

interface ServicesOverviewSectionProps {
  section: HomePageContent["servicesOverview"];
}

const ENGINEERING_HIGHLIGHTS = [
  "HVAC-R & environmental systems",
  "Facility management",
  "Automation & controls",
];

const AGRICULTURE_HIGHLIGHTS = [
  "Agricultural training",
  "Regenerative farming",
  "Sustainable implementation",
];

function PillarCard({
  title,
  href,
  highlights,
  variant,
}: {
  title: string;
  href: string;
  highlights: string[];
  variant: "engineering" | "agriculture";
}) {
  const Icon = variant === "engineering" ? Settings2 : Leaf;

  return (
    <Link
      href={href}
      className="capability-card group relative overflow-hidden rounded-2xl bg-white p-5 shadow-[0_16px_34px_rgba(2,33,23,0.08)] ring-1 ring-[#0a6d49]/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(2,33,23,0.14)] hover:ring-[#075f3f]/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075f3f] focus-visible:ring-offset-2"
    >
      <span
        aria-hidden
        className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#075f3f]/5 transition-transform duration-500 group-hover:scale-125"
      />
      <div className="relative flex items-center gap-4">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#075f3f] text-white shadow-[0_12px_26px_rgba(7,95,63,0.24)] transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-[#0f1f17]">{title}</h3>
        </div>
      </div>
      <ul className="relative mt-5 space-y-2.5">
        {highlights.map((item) => (
          <li key={item} className="flex items-center gap-2.5 text-sm text-slate-700">
            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e7f4ed] text-[#075f3f]">
              <Check className="h-3.5 w-3.5" />
            </span>
            {item}
          </li>
        ))}
      </ul>
      <span className="relative mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#075f3f]">
        Explore pillar
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

export default function ServicesOverviewSection({
  section,
}: ServicesOverviewSectionProps) {
  const eyebrow = section.eyebrow?.trim() || "WHAT WE OFFER";
  const title =
    section.title?.trim() || "Integrated Engineering & Agriculture Solutions";
  const description =
    section.description?.trim() ||
    "From HVAC-R, facility systems and industrial automation to agriculture-focused services, UESPAK delivers practical solutions designed for performance, reliability and long-term value.";
  const imageUrl = section.image?.url;
  const imageAlt =
    section.image?.altText ||
    "Integrated engineering and agriculture capabilities";

  return (
    <section className="animate-capability-fade-up relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#f7fbf8_0%,#edf7f1_52%,#ffffff_100%)] p-5 shadow-[0_24px_70px_rgba(2,33,23,0.10)] ring-1 ring-[#0a6d49]/10 sm:p-7 lg:p-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(7,95,63,0.10),transparent_32%),radial-gradient(circle_at_88%_18%,rgba(7,95,63,0.08),transparent_30%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(7,95,63,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(7,95,63,0.05)_1px,transparent_1px)] bg-[size:54px_54px] opacity-45"
      />

      <div className="relative grid items-center gap-9 lg:grid-cols-[minmax(0,1.04fr)_minmax(380px,0.96fr)] lg:gap-12 xl:gap-16">
        <div className="animate-capability-slide-left">
          <div className="inline-flex items-center gap-3">
            <span className="h-px w-10 bg-[#075f3f]" />
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#075f3f]">
              {eyebrow}
            </p>
          </div>

          <h2 className="mt-4 text-balance text-3xl font-extrabold leading-tight tracking-tight text-[#0f1f17] md:text-4xl xl:text-[2.75rem]">
            {title}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
            {description}
          </p>

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            <PillarCard
              title="Engineering Services"
              href="/services/group/engineering"
              highlights={ENGINEERING_HIGHLIGHTS}
              variant="engineering"
            />
            <PillarCard
              title="Agriculture Services"
              href="/services/group/agriculture"
              highlights={AGRICULTURE_HIGHLIGHTS}
              variant="agriculture"
            />
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="/services/group/engineering"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#075f3f] px-5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(7,95,63,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#03452e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075f3f] focus-visible:ring-offset-2"
            >
              Engineering Services
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/services/group/agriculture"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-[#8fc3a8] bg-white/80 px-5 text-sm font-semibold text-[#075f3f] transition-all hover:-translate-y-0.5 hover:border-[#075f3f] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075f3f] focus-visible:ring-offset-2"
            >
              Agriculture Services
            </Link>
            <Link
              href="/services"
              className="inline-flex h-11 items-center gap-1 text-sm font-semibold text-[#075f3f] transition-colors hover:text-[#03452e] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075f3f] focus-visible:ring-offset-2 sm:ml-1"
            >
              View All Services
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        <div className="animate-capability-slide-right relative">
          <span
            aria-hidden
            className="absolute -left-5 -top-5 hidden h-24 w-24 rounded-tl-3xl border-l-2 border-t-2 border-[#075f3f]/35 lg:block"
          />
          <span
            aria-hidden
            className="absolute -bottom-5 -right-5 hidden h-24 w-24 rounded-br-3xl border-b-2 border-r-2 border-[#075f3f]/35 lg:block"
          />

          <div className="group/image relative min-h-[360px] overflow-hidden rounded-[1.75rem] bg-[#063e2b] shadow-[0_28px_70px_rgba(2,33,23,0.22)] ring-1 ring-white/70">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={imageAlt}
                className="h-full min-h-[360px] w-full object-cover transition-transform duration-700 group-hover/image:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="grid min-h-[360px] place-items-center bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.18),transparent_34%),linear-gradient(135deg,#063e2b,#0f7a54)] p-8 text-center text-white">
                <div>
                  <Sparkles className="mx-auto h-8 w-8 text-emerald-100" />
                  <p className="mt-3 text-lg font-semibold">
                    Integrated Capability
                  </p>
                </div>
              </div>
            )}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(2,33,23,0.32)_0%,rgba(7,95,63,0.08)_48%,rgba(2,33,23,0.38)_100%)]"
            />
            <div className="capability-float absolute left-5 top-5 rounded-2xl bg-white/92 px-4 py-3 shadow-[0_16px_36px_rgba(2,33,23,0.18)] ring-1 ring-white/70 backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#e7f4ed] text-[#075f3f]">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#075f3f]">
                    Multi-Sector
                  </p>
                  <p className="text-sm font-bold text-[#0f1f17]">
                    Support
                  </p>
                </div>
              </div>
            </div>
            <div className="capability-float absolute bottom-5 right-5 rounded-2xl bg-white/92 px-4 py-3 shadow-[0_16px_36px_rgba(2,33,23,0.18)] ring-1 ring-white/70 backdrop-blur [animation-delay:900ms]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#075f3f]">
                Capability
              </p>
              <p className="text-sm font-bold text-[#0f1f17]">
                Engineering + Agriculture
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
