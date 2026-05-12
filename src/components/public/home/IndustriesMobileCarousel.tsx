"use client";

import { useEffect, useRef, useState } from "react";

interface IndustriesMobileCarouselProps {
  children: React.ReactNode[];
  className?: string;
  intervalMs?: number;
}

/**
 * Auto-advancing one-card-per-view carousel used on small screens for the
 * Industries section. The same JSX cards are rendered as-is so styling stays
 * consistent with the desktop grid; this wrapper just turns them into a
 * snap-scroll strip that auto-advances and pauses on touch interaction.
 */
export default function IndustriesMobileCarousel({
  children,
  className,
  intervalMs = 3500,
}: IndustriesMobileCarouselProps) {
  const slides = Array.isArray(children) ? children : [children];
  const total = slides.length;

  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const userScrollTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (total <= 1 || isPaused) return;
    const id = window.setInterval(() => {
      setActive((prev) => (prev + 1) % total);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [total, isPaused, intervalMs]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const child = el.children[active] as HTMLElement | undefined;
    if (!child) return;
    el.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
  }, [active]);

  function handleManualScroll() {
    setIsPaused(true);
    if (userScrollTimeout.current) {
      window.clearTimeout(userScrollTimeout.current);
    }
    userScrollTimeout.current = window.setTimeout(() => {
      setIsPaused(false);
    }, 4000);

    const el = trackRef.current;
    if (!el) return;
    const slideWidth = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).offsetWidth
      : el.clientWidth;
    if (slideWidth <= 0) return;
    const nextIdx = Math.round(el.scrollLeft / slideWidth);
    if (nextIdx !== active && nextIdx >= 0 && nextIdx < total) {
      setActive(nextIdx);
    }
  }

  if (total === 0) return null;

  return (
    <div className={className}>
      <div
        ref={trackRef}
        onScroll={handleManualScroll}
        onTouchStart={() => setIsPaused(true)}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className="snap-center shrink-0 basis-[88%] sm:basis-[60%]"
          >
            {slide}
          </div>
        ))}
      </div>

      {total > 1 ? (
        <div
          className="mt-4 flex items-center justify-center gap-2"
          role="tablist"
          aria-label="Industries carousel"
        >
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={idx === active}
              aria-label={`Show industry ${idx + 1}`}
              onClick={() => {
                setActive(idx);
                setIsPaused(true);
                if (userScrollTimeout.current) {
                  window.clearTimeout(userScrollTimeout.current);
                }
                userScrollTimeout.current = window.setTimeout(
                  () => setIsPaused(false),
                  4000
                );
              }}
              className={[
                "h-1.5 rounded-full transition-all duration-300",
                idx === active
                  ? "w-6 bg-[#075f3f]"
                  : "w-1.5 bg-emerald-900/25 hover:bg-emerald-900/45",
              ].join(" ")}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
