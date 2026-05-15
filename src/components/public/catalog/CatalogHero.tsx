import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Container from "@/components/shared/Container";

export interface CatalogBreadcrumb {
  label: string;
  href?: string;
}

interface CatalogHeroProps {
  eyebrow?: string;
  title: string;
  description: string;
  backgroundImageUrl?: string;
  /** 0–1 overlay strength over background image (default 0.88) */
  overlayOpacity?: number;
  breadcrumbs?: CatalogBreadcrumb[];
  badge?: string;
  primaryCta?: { label: string; href: string };
}

export default function CatalogHero({
  eyebrow,
  title,
  description,
  backgroundImageUrl,
  overlayOpacity = 0.88,
  breadcrumbs,
  badge,
  primaryCta,
}: CatalogHeroProps) {
  const bg = backgroundImageUrl?.trim();
  const overlay = Math.min(1, Math.max(0, overlayOpacity));

  return (
    <section
      className="homepage-section-reveal relative isolate min-h-[380px] overflow-hidden bg-[#052f21] py-24 text-white md:min-h-[440px] md:py-28 lg:min-h-[480px] lg:py-32"
      style={
        bg
          ? undefined
          : {
              backgroundImage:
                "linear-gradient(135deg,#052f21 0%,#075f3f 55%,#021b14 100%)",
            }
      }
    >
      {bg ? (
        <>
          <div
            aria-hidden
            className="absolute inset-0 -z-20 bg-cover bg-center"
            style={{ backgroundImage: `url("${bg}")` }}
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[#052f21]"
            style={{ opacity: overlay }}
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(3,39,28,0.55),rgba(5,47,33,0.35),rgba(2,18,14,0.5))]"
          />
        </>
      ) : null}
      <div aria-hidden className="absolute inset-0 bg-[#052f21]/15" />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.65) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        aria-hidden
        className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-emerald-300/15 blur-3xl"
      />

      <Container className="relative z-10">
        {breadcrumbs?.length ? (
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-emerald-100/90">
            <ol className="flex flex-wrap items-center gap-1.5">
              {breadcrumbs.map((crumb, idx) => (
                <li key={`${crumb.label}-${idx}`} className="flex items-center gap-1.5">
                  {idx > 0 ? <span className="text-emerald-200/50">/</span> : null}
                  {crumb.href ? (
                    <Link href={crumb.href} className="transition-colors hover:text-white">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-medium text-white">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <div className="max-w-3xl">
          {badge ? (
            <span className="inline-flex rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#075f3f] shadow-[0_8px_18px_rgba(0,0,0,0.2)]">
              {badge}
            </span>
          ) : null}
          {eyebrow ? (
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.32em] text-emerald-100">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-4 text-balance text-4xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-[3.25rem]">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-emerald-50/90 md:text-lg">
            {description}
          </p>
          {primaryCta ? (
            <Link
              href={primaryCta.href}
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#075f3f] shadow-[0_16px_32px_rgba(0,0,0,0.22)] transition-all hover:-translate-y-0.5 hover:bg-emerald-50"
            >
              {primaryCta.label}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
