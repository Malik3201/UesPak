"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { MouseEvent, KeyboardEvent } from "react";
import type { TeamMemberDto } from "@/types/team";

interface TeamMemberCardProps {
  member: TeamMemberDto;
  variant?: "default" | "highlight";
  isRevealed?: boolean;
  onCardActivate?: (memberId: string) => void;
}

export default function TeamMemberCard({
  member,
  variant = "default",
  isRevealed = false,
  onCardActivate,
}: TeamMemberCardProps) {
  const isHighlight = variant === "highlight";
  const initials = member.name.slice(0, 2).toUpperCase();
  const hasImage = Boolean(member.image?.url);
  const detailHref = `/team/${member.slug}`;

  const handleCardClick = () => {
    onCardActivate?.(member.id);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onCardActivate?.(member.id);
    }
  };

  const stopProp = (event: MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <div
      data-revealed={isRevealed ? "true" : "false"}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="group"
      aria-label={`${member.name}, ${member.designation}`}
      className={[
        "team-card group/team relative isolate flex h-full min-h-[23.5rem] flex-col overflow-hidden rounded-2xl transition-all duration-500 ease-out cursor-pointer select-none sm:min-h-[24rem]",
        isHighlight
          ? "bg-white shadow-[0_18px_38px_rgba(7,95,63,0.18)] ring-1 ring-emerald-100"
          : "bg-[#f5f7f6] shadow-[0_8px_22px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04]",
        "hover:-translate-y-1 hover:shadow-[0_24px_46px_rgba(7,95,63,0.32)] hover:ring-emerald-200",
        "data-[revealed=true]:-translate-y-1 data-[revealed=true]:shadow-[0_24px_46px_rgba(7,95,63,0.32)] data-[revealed=true]:ring-emerald-200",
      ].join(" ")}
    >
      {/* Hover/revealed full-image background */}
      {hasImage ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-0 transition-opacity duration-500 ease-out group-hover/team:opacity-100 group-data-[revealed=true]/team:opacity-100"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={member.image!.url}
            alt=""
            className="h-full w-full object-cover transition-transform duration-[700ms] ease-out group-hover/team:scale-105 group-data-[revealed=true]/team:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#03452e]/20 via-[#03452e]/55 to-[#03452e]/95" />
        </div>
      ) : null}

      {/* Default centered profile layer */}
      <div
        className={[
          "relative z-10 flex h-full flex-1 flex-col items-center px-6 pb-6 pt-8 text-center transition-all duration-500 ease-out sm:pt-10",
          hasImage
            ? "group-hover/team:-translate-y-2 group-hover/team:opacity-0 group-hover/team:pointer-events-none group-data-[revealed=true]/team:-translate-y-2 group-data-[revealed=true]/team:opacity-0 group-data-[revealed=true]/team:pointer-events-none"
            : "",
        ].join(" ")}
      >
        <div className="flex h-36 shrink-0 items-start justify-center sm:h-40">
          <div
            className={[
              "relative h-32 w-32 rounded-full p-[3px] transition-all duration-300 sm:h-36 sm:w-36",
              isHighlight
                ? "bg-[#075f3f]"
                : "bg-[#0c8b59]/40 group-hover/team:bg-[#075f3f]",
            ].join(" ")}
          >
            <div className="h-full w-full overflow-hidden rounded-full bg-white p-[3px]">
              <div className="relative h-full w-full overflow-hidden rounded-full bg-emerald-50">
                {hasImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={member.image!.url}
                    alt={member.image?.altText || member.name}
                    className="h-full w-full rounded-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center rounded-full">
                    <span className="text-2xl font-extrabold text-[#075f3f]">
                      {initials}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 flex w-full flex-col items-center gap-1 sm:mt-4">
          <h3 className="line-clamp-2 min-h-[2.75rem] text-base font-extrabold uppercase leading-snug tracking-wide text-foreground sm:text-lg">
            {member.name}
          </h3>
          <p className="line-clamp-2 min-h-9 text-xs font-semibold lowercase leading-relaxed tracking-wide text-[#075f3f] sm:text-sm">
            {member.designation}
          </p>
        </div>

        {member.shortBio ? (
          <p className="mt-3 line-clamp-2 min-h-11 text-sm leading-relaxed text-muted-foreground">
            {member.shortBio}
          </p>
        ) : (
          <div aria-hidden="true" className="mt-3 min-h-11" />
        )}

        <div className="mt-auto pt-5">
          <Link
            href={detailHref}
            onClick={stopProp}
            aria-label={`View ${member.name}'s profile`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#075f3f] px-5 text-xs font-semibold text-white shadow-[0_10px_22px_rgba(7,95,63,0.25)] transition-all duration-300 hover:bg-[#03452e] hover:shadow-[0_14px_28px_rgba(7,95,63,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075f3f] focus-visible:ring-offset-2"
          >
            View Profile
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Hover/revealed overlay content */}
      {hasImage ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex translate-y-4 flex-col items-center gap-2.5 px-6 pb-7 pt-12 text-center opacity-0 transition-all duration-500 ease-out group-hover/team:pointer-events-auto group-hover/team:translate-y-0 group-hover/team:opacity-100 group-data-[revealed=true]/team:pointer-events-auto group-data-[revealed=true]/team:translate-y-0 group-data-[revealed=true]/team:opacity-100">
          <h3 className="text-2xl font-extrabold leading-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
            {member.name}
          </h3>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-100">
            {member.designation}
          </p>
          <Link
            href={detailHref}
            onClick={stopProp}
            aria-label={`View ${member.name}'s profile`}
            className="mt-2 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-white px-5 text-xs font-semibold text-[#075f3f] shadow-[0_12px_24px_rgba(0,0,0,0.28)] transition-all duration-300 hover:bg-emerald-50 hover:shadow-[0_16px_32px_rgba(0,0,0,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            View Profile
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 hover:translate-x-0.5" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
