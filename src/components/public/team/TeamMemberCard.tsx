import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { TeamMemberDto } from "@/types/team";

interface TeamMemberCardProps {
  member: TeamMemberDto;
  variant?: "default" | "highlight";
}

export default function TeamMemberCard({
  member,
  variant = "default",
}: TeamMemberCardProps) {
  const isHighlight = variant === "highlight";
  const initials = member.name.slice(0, 2).toUpperCase();

  return (
    <article
      className={[
        "team-card group/team relative flex h-full flex-col items-center rounded-2xl px-6 pb-6 pt-10 text-center transition-all duration-300",
        isHighlight
          ? "bg-white shadow-[0_18px_38px_rgba(7,95,63,0.18)] ring-1 ring-emerald-100"
          : "bg-[#f5f7f6] shadow-[0_8px_22px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04] hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_38px_rgba(7,95,63,0.18)] hover:ring-emerald-100",
      ].join(" ")}
    >
      {/* Green ring portrait frame */}
      <div className="relative">
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
              {member.image?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.image.url}
                  alt={member.image.altText || member.name}
                  className="h-full w-full rounded-full object-cover transition-transform duration-500 group-hover/team:scale-[1.04]"
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

      {/* Name + designation */}
      <div className="mt-5 w-full space-y-1">
        <h3 className="text-base font-extrabold uppercase tracking-wide text-foreground sm:text-lg">
          {member.name}
        </h3>
        <p className="text-xs font-semibold lowercase tracking-wide text-[#075f3f] sm:text-sm">
          {member.designation}
        </p>
      </div>

      {/* Optional short summary, 2-line max */}
      {member.shortBio ? (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {member.shortBio}
        </p>
      ) : null}

      {/* View Profile CTA */}
      <Link
        href={`/team/${member.slug}`}
        aria-label={`View ${member.name}'s profile`}
        className={[
          "group/cta mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-xs font-semibold transition-all duration-300",
          "bg-[#075f3f] text-white shadow-[0_10px_22px_rgba(7,95,63,0.25)] hover:bg-[#03452e] hover:shadow-[0_14px_28px_rgba(7,95,63,0.35)]",
        ].join(" ")}
      >
        View Profile
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/cta:translate-x-0.5" />
      </Link>
    </article>
  );
}
