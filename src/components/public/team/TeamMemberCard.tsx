import Link from "next/link";
import { ExternalLink, Mail, Phone } from "lucide-react";
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

  return (
    <article
      className={[
        "team-card group/team relative flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-500",
        isHighlight
          ? "border-transparent bg-[#075f3f] text-white shadow-[0_24px_50px_rgba(2,33,23,0.35)]"
          : "border-black/5 bg-white text-foreground shadow-[0_14px_30px_rgba(15,23,42,0.08)] hover:-translate-y-1.5 hover:border-emerald-200 hover:shadow-[0_24px_50px_rgba(2,33,23,0.18)] hover:bg-[#075f3f] hover:text-white",
      ].join(" ")}
    >
      <div className="relative overflow-hidden rounded-t-2xl">
        <div
          className={[
            "relative aspect-[4/5] w-full overflow-hidden",
            isHighlight
              ? "bg-[#03452e]"
              : "bg-emerald-50 transition-colors duration-500 group-hover/team:bg-[#03452e]",
          ].join(" ")}
        >
          {member.image?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.image.url}
              alt={member.image.altText || member.name}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/team:scale-[1.05]"
              loading="lazy"
            />
          ) : (
            <div className="grid h-full w-full place-items-center">
              <span
                className={[
                  "text-4xl font-extrabold",
                  isHighlight ? "text-white/85" : "text-[#075f3f]/80",
                ].join(" ")}
              >
                {member.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="space-y-1">
          <h3
            className={[
              "text-lg font-bold leading-snug",
              isHighlight
                ? "text-white"
                : "text-foreground transition-colors group-hover/team:text-white",
            ].join(" ")}
          >
            {member.name}
          </h3>
          <p
            className={[
              "text-xs font-semibold uppercase tracking-[0.18em]",
              isHighlight
                ? "text-emerald-100/90"
                : "text-[#075f3f] transition-colors group-hover/team:text-emerald-100/90",
            ].join(" ")}
          >
            {member.designation}
          </p>
          {member.department ? (
            <p
              className={[
                "text-xs",
                isHighlight
                  ? "text-emerald-100/75"
                  : "text-muted-foreground transition-colors group-hover/team:text-emerald-100/80",
              ].join(" ")}
            >
              {member.department}
            </p>
          ) : null}
        </div>

        {member.shortBio ? (
          <p
            className={[
              "line-clamp-3 text-sm leading-relaxed",
              isHighlight
                ? "text-emerald-50/90"
                : "text-muted-foreground transition-colors group-hover/team:text-emerald-50/90",
            ].join(" ")}
          >
            {member.shortBio}
          </p>
        ) : null}

        {member.expertise?.length ? (
          <ul className="mt-auto flex flex-wrap gap-1.5">
            {member.expertise.slice(0, 3).map((skill) => (
              <li
                key={`${member.id}-${skill}`}
                className={[
                  "rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wide",
                  isHighlight
                    ? "bg-white/10 text-emerald-50"
                    : "bg-emerald-50 text-[#075f3f] transition-colors group-hover/team:bg-white/10 group-hover/team:text-emerald-50",
                ].join(" ")}
              >
                {skill}
              </li>
            ))}
          </ul>
        ) : null}

        <div
          className={[
            "mt-3 flex items-center justify-between gap-2 border-t pt-3 text-xs",
            isHighlight
              ? "border-white/15 text-emerald-100/85"
              : "border-black/5 text-muted-foreground transition-colors group-hover/team:border-white/15 group-hover/team:text-emerald-100/85",
          ].join(" ")}
        >
          <div className="flex items-center gap-3">
            {member.linkedinUrl ? (
              <Link
                href={member.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${member.name} on LinkedIn`}
                className="transition-colors hover:opacity-80"
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
            ) : null}
            {member.email ? (
              <a
                href={`mailto:${member.email}`}
                aria-label={`Email ${member.name}`}
                className="transition-colors hover:opacity-80"
              >
                <Mail className="h-4 w-4" />
              </a>
            ) : null}
            {member.phone ? (
              <a
                href={`tel:${member.phone.replace(/\s+/g, "")}`}
                aria-label={`Call ${member.name}`}
                className="transition-colors hover:opacity-80"
              >
                <Phone className="h-4 w-4" />
              </a>
            ) : null}
          </div>
          {member.experienceYears ? (
            <span className="font-semibold">
              {member.experienceYears}+ yrs
            </span>
          ) : null}
        </div>

        <Link
          href={`/team/${member.slug}`}
          className={[
            "mt-1 inline-flex h-9 items-center justify-center rounded-full text-xs font-semibold transition-all",
            isHighlight
              ? "bg-white text-[#075f3f] hover:bg-emerald-50"
              : "bg-[#075f3f] text-white hover:bg-[#03452e] group-hover/team:bg-white group-hover/team:text-[#075f3f]",
          ].join(" ")}
        >
          View Profile
        </Link>
      </div>
    </article>
  );
}
