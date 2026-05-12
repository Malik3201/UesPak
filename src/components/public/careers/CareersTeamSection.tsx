"use client";

import { useCallback, useEffect, useState } from "react";
import TeamMemberCard from "@/components/public/team/TeamMemberCard";
import type { TeamMemberDto } from "@/types/team";

interface CareersTeamSectionProps {
  members: TeamMemberDto[];
  eyebrow?: string;
  title?: string;
  description?: string;
}

export default function CareersTeamSection({
  members,
  eyebrow,
  title,
  description,
}: CareersTeamSectionProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isTouch, setIsTouch] = useState(false);

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

  if (!members.length) return null;

  return (
    <section className="section-py bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#075f3f]">
            {eyebrow || "Our Team"}
          </p>
          <h2 className="mt-3 text-balance text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl">
            {title || "Meet Our Professionals"}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            {description ||
              "A qualified team of engineers and specialists supporting reliable project delivery across engineering, automation and agriculture sectors."}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {members.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              variant="default"
              isRevealed={activeId === member.id}
              onCardActivate={handleCardActivate}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
