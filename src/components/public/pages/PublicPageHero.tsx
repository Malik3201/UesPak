import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Container from "@/components/shared/Container";
import type { PageHero } from "@/types/page-content";

interface PublicPageHeroProps {
  hero: PageHero;
  fallbackTitle: string;
  fallbackDescription: string;
  fallbackEyebrow?: string;
}

export default function PublicPageHero({
  hero,
  fallbackTitle,
  fallbackDescription,
  fallbackEyebrow,
}: PublicPageHeroProps) {
  const bg = hero.backgroundImage?.url?.trim();

  return (
    <section
      className="relative isolate min-h-[420px] overflow-hidden bg-[#052f21] py-28 text-white md:min-h-[500px] md:py-32 lg:min-h-[560px] lg:py-40"
      style={{
        backgroundImage: bg
          ? `linear-gradient(135deg, rgba(3,39,28,0.88), rgba(5,47,33,0.74), rgba(2,18,14,0.86)), url("${bg}")`
          : "linear-gradient(135deg,#052f21 0%,#075f3f 55%,#021b14 100%)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div aria-hidden="true" className="absolute inset-0 bg-[#052f21]/20" />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.13]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.7) 1px, transparent 0)",
          backgroundSize: "30px 30px",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute -right-28 top-1/4 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl"
      />

      <Container className="relative">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-100">
            {hero.eyebrow || fallbackEyebrow || "UESPAK"}
          </p>
          <h1 className="mt-5 text-balance text-4xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-6xl">
            {hero.title || fallbackTitle}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-emerald-50/90 md:text-lg">
            {hero.description || fallbackDescription}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {hero.primaryButtonText && hero.primaryButtonUrl ? (
              <Link
                href={hero.primaryButtonUrl}
                className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#075f3f] shadow-[0_16px_32px_rgba(0,0,0,0.22)] transition-all hover:-translate-y-0.5 hover:bg-emerald-50"
              >
                {hero.primaryButtonText}
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            ) : null}
            {hero.secondaryButtonText && hero.secondaryButtonUrl ? (
              <Link
                href={hero.secondaryButtonUrl}
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/15"
              >
                {hero.secondaryButtonText}
              </Link>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
