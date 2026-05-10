"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Compass,
  Heart,
  Play,
  Rocket,
  Sparkles,
  X,
} from "lucide-react";
import type { HomePageContent } from "@/types/home-page";

interface VisionMissionSectionProps {
  section: HomePageContent["visionMission"];
}

export default function VisionMissionSection({
  section,
}: VisionMissionSectionProps) {
  const [open, setOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const eyebrow = section.eyebrow?.trim() || "OUR PURPOSE";
  const title = section.title?.trim() || "Guided by Vision, Driven by Mission";
  const visionTitle = section.visionTitle?.trim() || "Vision";
  const visionDescription =
    section.visionDescription?.trim() ||
    "To be a trusted leader in engineering, automation, and agriculture solutions.";
  const missionTitle = section.missionTitle?.trim() || "Mission";
  const missionDescription =
    section.missionDescription?.trim() ||
    "Deliver practical, high-quality, and future-ready solutions through technical excellence.";
  const valuesTitle = section.valuesTitle?.trim() || "Values";
  const valuesDescription =
    section.valuesDescription?.trim() ||
    "Integrity, safety, quality, innovation, and client-focused execution.";

  const videoUrl = section.video?.url?.trim();
  const posterUrl =
    section.videoPoster?.url?.trim() || section.image?.url?.trim() || "";
  const posterAlt =
    section.videoPoster?.altText ||
    section.image?.altText ||
    "UESPAK overview preview";
  const videoLabel =
    section.videoTitle?.trim() || "Watch UESPAK Overview";
  const videoCaption =
    section.videoDescription?.trim() ||
    "A short look at UESPAK delivering engineering, automation and agriculture solutions.";

  const closeModal = useCallback(() => {
    const v = videoRef.current;
    if (v) {
      v.pause();
      try {
        v.currentTime = 0;
      } catch {
        /* no-op */
      }
    }
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, closeModal]);

  const cards = [
    {
      key: "vision",
      label: "Vision",
      title: visionTitle,
      description: visionDescription,
      Icon: Compass,
    },
    {
      key: "mission",
      label: "Mission",
      title: missionTitle,
      description: missionDescription,
      Icon: Rocket,
    },
    {
      key: "values",
      label: "Values",
      title: valuesTitle,
      description: valuesDescription,
      Icon: Heart,
    },
  ];

  return (
    <section className="vision-mission-fade-up relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-[0_24px_70px_rgba(2,33,23,0.10)] ring-1 ring-[#0a6d49]/10 sm:p-9 lg:p-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_15%,rgba(7,95,63,0.10),transparent_36%),radial-gradient(circle_at_92%_85%,rgba(7,95,63,0.09),transparent_38%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(7,95,63,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(7,95,63,0.04)_1px,transparent_1px)] bg-[size:60px_60px] opacity-45"
      />

      <div className="relative">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-3">
            <span className="h-px w-10 bg-[#075f3f]" />
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#075f3f]">
              {eyebrow}
            </p>
            <span className="h-px w-10 bg-[#075f3f]" />
          </div>
          <h2 className="mt-4 text-balance text-3xl font-extrabold leading-tight tracking-tight text-[#0f1f17] md:text-4xl xl:text-[2.75rem]">
            {title}
          </h2>
        </div>

        <div className="mt-12 grid items-center gap-12 lg:mt-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.95fr)] lg:gap-14">
          <div className="vision-mission-slide-left space-y-5">
            {cards.map(({ key, label, title: cardTitle, description, Icon }, idx) => (
              <article
                key={key}
                className="vision-mission-card group relative overflow-hidden rounded-2xl bg-white p-5 shadow-[0_16px_36px_rgba(2,33,23,0.08)] ring-1 ring-[#0a6d49]/12 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(2,33,23,0.14)] hover:ring-[#075f3f]/35 sm:p-6"
                style={{ animationDelay: `${260 + idx * 110}ms` }}
              >
                <span
                  aria-hidden
                  className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#075f3f]/5 transition-transform duration-500 group-hover:scale-125"
                />
                <div className="relative flex items-start gap-4">
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#075f3f] text-white shadow-[0_12px_26px_rgba(7,95,63,0.24)] transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#075f3f]">
                      {label}
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-[#0f1f17] sm:text-xl">
                      {cardTitle}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="vision-mission-slide-right relative">
            <span
              aria-hidden
              className="absolute -left-4 -top-4 hidden h-20 w-20 rounded-tl-3xl border-l-2 border-t-2 border-[#075f3f]/35 lg:block"
            />
            <span
              aria-hidden
              className="absolute -bottom-4 -right-4 hidden h-20 w-20 rounded-br-3xl border-b-2 border-r-2 border-[#075f3f]/35 lg:block"
            />

            <button
              type="button"
              disabled={!videoUrl}
              onClick={() => videoUrl && setOpen(true)}
              aria-label={
                videoUrl
                  ? "Play UESPAK overview video"
                  : "UESPAK overview preview"
              }
              className={`group/video relative block w-full overflow-hidden rounded-[1.75rem] bg-[#063e2b] text-left shadow-[0_28px_70px_rgba(2,33,23,0.22)] ring-1 ring-white/60 transition-transform duration-500 ${
                videoUrl
                  ? "cursor-pointer hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_36px_80px_rgba(2,33,23,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075f3f] focus-visible:ring-offset-2"
                  : "cursor-default"
              }`}
            >
              {posterUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={posterUrl}
                  alt={posterAlt}
                  className="aspect-[4/3] h-full w-full object-cover transition-transform duration-700 group-hover/video:scale-[1.04]"
                  loading="lazy"
                />
              ) : (
                <div className="grid aspect-[4/3] place-items-center bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_40%),linear-gradient(135deg,#063e2b,#0f7a54)] p-8 text-center text-white">
                  <div>
                    <Sparkles className="mx-auto h-9 w-9 text-emerald-100" />
                    <p className="mt-3 text-lg font-semibold">
                      UESPAK Overview
                    </p>
                  </div>
                </div>
              )}

              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(2,33,23,0.18)_0%,rgba(2,33,23,0.18)_45%,rgba(2,33,23,0.65)_100%)]"
              />

              {videoUrl ? (
                <span
                  aria-hidden
                  className="vision-play-pulse absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[#075f3f] shadow-[0_18px_42px_rgba(2,33,23,0.32)] transition-transform duration-300 group-hover/video:scale-110 sm:h-24 sm:w-24"
                >
                  <Play className="h-7 w-7 translate-x-0.5 sm:h-9 sm:w-9" fill="currentColor" />
                </span>
              ) : null}

              <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3 text-white">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-emerald-100/95">
                    UESPAK Story
                  </p>
                  <p className="mt-1 truncate text-base font-bold sm:text-lg">
                    {videoLabel}
                  </p>
                </div>
                {videoUrl ? (
                  <span className="hidden rounded-full border border-white/40 bg-white/15 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur sm:inline-flex">
                    Play video
                  </span>
                ) : null}
              </div>
            </button>

            {videoCaption ? (
              <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-600">
                {videoCaption}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {open && videoUrl && typeof document !== "undefined"
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={videoLabel}
              className="vision-modal-fade fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 px-4 py-6 backdrop-blur-sm"
              onClick={(e) => {
                if (e.target === e.currentTarget) closeModal();
              }}
            >
              <div className="relative w-full max-w-4xl">
                <button
                  ref={closeButtonRef}
                  type="button"
                  aria-label="Close video"
                  onClick={closeModal}
                  className="absolute -right-2 -top-12 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#075f3f] shadow-[0_12px_28px_rgba(0,0,0,0.4)] transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 sm:right-0"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="overflow-hidden rounded-2xl bg-black shadow-[0_30px_70px_rgba(0,0,0,0.55)]">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    poster={posterUrl || undefined}
                    controls
                    autoPlay
                    playsInline
                    className="aspect-video h-auto w-full bg-black"
                  >
                    Your browser does not support embedded video.
                  </video>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </section>
  );
}
