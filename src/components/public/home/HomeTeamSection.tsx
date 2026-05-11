"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import TeamMemberCard from "@/components/public/team/TeamMemberCard";
import type { HomePageContent } from "@/types/home-page";
import type { TeamMemberDto } from "@/types/team";

interface HomeTeamSectionProps {
  section: HomePageContent["teamPreview"];
  members: TeamMemberDto[];
}

const MAX_VISIBLE = 12;

export default function HomeTeamSection({
  section,
  members,
}: HomeTeamSectionProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isTouch, setIsTouch] = useState(false);

  const visible = useMemo(() => members.slice(0, MAX_VISIBLE), [members]);
  const enableAuto = visible.length > 1;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setIsTouch(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const handleCardActivate = useCallback(
    (id: string) => {
      if (!isTouch) return;
      setActiveId((prev) => (prev === id ? null : id));
    },
    [isTouch],
  );

  function getStep(track: HTMLDivElement) {
    const card = track.querySelector<HTMLElement>("[data-team-card]");
    if (card?.offsetWidth) return card.offsetWidth + 24;
    return Math.max(track.clientWidth * 0.8, 240);
  }

  useEffect(() => {
    if (!enableAuto || isPaused || activeId) return;
    const track = trackRef.current;
    if (!track) return;
    const id = window.setInterval(() => {
      const max = track.scrollWidth - track.clientWidth - 4;
      if (track.scrollLeft >= max) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        track.scrollBy({ left: getStep(track), behavior: "smooth" });
      }
    }, 4500);
    return () => window.clearInterval(id);
  }, [enableAuto, isPaused, activeId, visible.length]);

  if (!visible.length) return null;

  const title = section.title?.trim() || "Meet Our Professionals";
  const description =
    section.description?.trim() ||
    "A qualified team of engineers and specialists driving reliable project performance.";

  return (
    <section className="bg-white py-10 md:py-14 lg:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#075f3f]">
            Our Team
          </p>
          <h2 className="mt-3 text-balance text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            {description}
          </p>
        </div>

        <div
          className="relative mt-8 md:mt-10"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            ref={trackRef}
            className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4"
          >
            {visible.map((member) => (
              <div
                key={member.id}
                data-team-card
                className="shrink-0 basis-full snap-start sm:basis-[calc((100%-1.5rem)/2)] lg:basis-[calc((100%-3rem)/3)] xl:basis-[calc((100%-4.5rem)/4)]"
              >
                <TeamMemberCard
                  member={member}
                  variant="default"
                  isRevealed={activeId === member.id}
                  onCardActivate={handleCardActivate}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
