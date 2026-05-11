import TeamMemberCard from "@/components/public/team/TeamMemberCard";
import type { TeamMemberDto } from "@/types/team";

interface CareersTeamSectionProps {
  members: TeamMemberDto[];
}

export default function CareersTeamSection({ members }: CareersTeamSectionProps) {
  if (!members.length) return null;

  return (
    <section className="section-py bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#075f3f]">
            Our Team
          </p>
          <h2 className="mt-3 text-balance text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl">
            Meet Our Professionals
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            A qualified team of engineers and specialists supporting reliable
            project delivery across engineering, automation and agriculture
            sectors.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {members.map((member) => (
            <TeamMemberCard key={member.id} member={member} variant="default" />
          ))}
        </div>
      </div>
    </section>
  );
}
