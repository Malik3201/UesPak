"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import Container from "@/components/shared/Container";
import type { HomePageContent } from "@/types/home-page";

interface HomeHeroProps {
  hero: HomePageContent["hero"];
}

export default function HomeHero({ hero }: HomeHeroProps) {
  const images = useMemo(() => {
    const fromList =
      Array.isArray(hero.backgroundImages) && hero.backgroundImages.length > 0
        ? hero.backgroundImages
        : hero.backgroundImage?.url
          ? [hero.backgroundImage]
          : [];
    return fromList.filter((item) => Boolean(item?.url));
  }, [hero.backgroundImage, hero.backgroundImages]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [images.length]);

  return (
    <section className="relative -mt-16 overflow-hidden bg-gradient-to-br from-[#063e2b] via-[#075f3f] to-[#0b6f4b] pt-16 text-white md:-mt-[7.25rem] md:pt-[7.25rem]">
      <div className="absolute inset-0">
        {images.length ? (
          images.map((image, idx) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${image.publicId}-${idx}`}
              src={image.url}
              alt={image.altText || `UESPAK Hero ${idx + 1}`}
              className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[1600ms] ease-out ${
                idx === activeIndex ? "opacity-100 scale-105" : "opacity-0 scale-100"
              }`}
            />
          ))
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_38%),radial-gradient(circle_at_80%_25%,rgba(255,255,255,0.08),transparent_34%)]" />
        )}
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(2,41,28,0.6)_0%,rgba(4,64,43,0.48)_52%,rgba(10,25,17,0.36)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:52px_52px] opacity-20" />

      <Container className="relative flex min-h-[78vh] items-center justify-center py-20 sm:py-24 lg:min-h-[82vh] lg:py-28">
        <div className="hero-animate mx-auto flex w-full max-w-3xl flex-col items-center space-y-7 text-center sm:px-2 lg:px-6">
          {hero.eyebrow ? (
            <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              {hero.eyebrow}
            </p>
          ) : null}
          {hero.subtitle ? (
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-100/90 md:text-sm">
              {hero.subtitle}
            </p>
          ) : null}
          {hero.title ? (
            <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl xl:text-6xl">
              {hero.title}
            </h1>
          ) : null}
          <span className="block h-px w-24 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          {hero.description ? (
            <p className="mx-auto max-w-[760px] text-center text-sm font-medium leading-7 text-emerald-50/95 sm:text-base sm:leading-8 lg:text-lg lg:leading-9">
              {hero.description}
            </p>
          ) : null}
          <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
            {hero.primaryButtonText && hero.primaryButtonUrl ? (
              <Link
                href={hero.primaryButtonUrl}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-7 text-sm font-semibold text-[#075f3f] shadow-[0_12px_30px_rgba(0,0,0,0.25)] transition-all hover:-translate-y-0.5 hover:bg-emerald-50"
              >
                {hero.primaryButtonText}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
            {hero.secondaryButtonText && hero.secondaryButtonUrl ? (
              <Link
                href={hero.secondaryButtonUrl}
                className="inline-flex h-12 items-center justify-center rounded-lg border border-white/40 bg-white/5 px-7 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15"
              >
                {hero.secondaryButtonText}
              </Link>
            ) : null}
          </div>
          {hero.badges?.length ? (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
              {hero.badges.map((badge, idx) => (
                <span
                  key={`hero-badge-${idx}`}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-emerald-50 backdrop-blur-sm"
                >
                  {badge}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </Container>

      {images.length > 1 ? (
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
          {images.map((image, idx) => (
            <button
              key={`hero-dot-${image.publicId}-${idx}`}
              type="button"
              aria-label={`View slide ${idx + 1}`}
              onClick={() => setActiveIndex(idx)}
              className={`h-2.5 rounded-full transition-all ${
                idx === activeIndex ? "w-8 bg-white" : "w-2.5 bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

