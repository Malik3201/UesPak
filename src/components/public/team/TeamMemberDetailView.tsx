import Link from "next/link";
import {
  ArrowRight,
  Check,
  ExternalLink,
  Mail,
  Users,
} from "lucide-react";
import Container from "@/components/shared/Container";
import DetailHero from "@/components/public/catalog/DetailHero";
import TeamMemberCard from "@/components/public/team/TeamMemberCard";
import { formatTeamExperienceYears } from "@/lib/team";
import type { TeamMemberDto } from "@/types/team";

interface TeamMemberDetailViewProps {
  member: TeamMemberDto;
  relatedMembers: TeamMemberDto[];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getLinkedInUrl(member: TeamMemberDto): string | undefined {
  const direct = member.linkedinUrl?.trim();
  if (direct) return direct;
  const fromSocial = member.socialLinks?.find(
    (link) =>
      link.url?.trim() &&
      (/linkedin/i.test(link.url) || /linkedin/i.test(link.label || ""))
  );
  return fromSocial?.url?.trim();
}

export default function TeamMemberDetailView({
  member,
  relatedMembers,
}: TeamMemberDetailViewProps) {
  const experienceLabel = formatTeamExperienceYears(member.experienceYears);
  const linkedInUrl = getLinkedInUrl(member);
  const fullBio = member.bio?.trim();
  const shortBio = member.shortBio?.trim();
  const heroExcerpt = shortBio || (fullBio && fullBio.length <= 280 ? fullBio : undefined);

  const metaChips: Array<{ label: string; value: string }> = [];
  if (experienceLabel) {
    metaChips.push({ label: "Experience", value: experienceLabel });
  }
  if (member.department?.trim()) {
    metaChips.push({ label: "Department", value: member.department.trim() });
  }
  if (member.designation?.trim()) {
    metaChips.push({ label: "Role", value: member.designation.trim() });
  }

  const qualifications = member.qualifications.filter(Boolean);
  const expertise = member.expertise.filter(Boolean);
  const showProfessionalProfile =
    Boolean(fullBio) && fullBio !== shortBio;

  return (
    <>
      <DetailHero
        title={member.name}
        excerpt={heroExcerpt}
        badge={member.designation?.trim() || undefined}
        backgroundImageUrl={member.image?.url}
        showEngineeringPattern
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Team", href: "/careers#team" },
          { label: member.name },
        ]}
        metaChips={metaChips.length ? metaChips : undefined}
      />

      {/* Profile overview */}
      <section className="homepage-section-reveal w-full bg-[#f7fbf8] py-12 md:py-16 lg:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,380px)_1fr] lg:items-start lg:gap-14 xl:grid-cols-[minmax(0,420px)_1fr]">
            <div className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
              <div className="overflow-hidden rounded-3xl bg-emerald-50/80 p-3 shadow-[0_20px_50px_rgba(7,95,63,0.12)] ring-1 ring-emerald-100/80">
                <div className="overflow-hidden rounded-2xl ring-2 ring-[#075f3f]/20 ring-offset-2 ring-offset-emerald-50/80">
                  {member.image?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.image.url}
                      alt={member.image.altText?.trim() || member.name}
                      className="aspect-[4/5] w-full object-cover object-center"
                    />
                  ) : (
                    <div
                      className="flex aspect-[4/5] w-full items-center justify-center bg-gradient-to-br from-emerald-100 to-emerald-50"
                      aria-hidden
                    >
                      <span className="text-5xl font-extrabold tracking-tight text-[#075f3f] md:text-6xl">
                        {getInitials(member.name)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="min-w-0 space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#075f3f]">
                  Profile Overview
                </p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                  {member.name}
                </h2>
                {member.designation?.trim() ? (
                  <p className="mt-2 text-lg font-semibold text-[#075f3f]">
                    {member.designation}
                  </p>
                ) : null}
                {member.department?.trim() ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {member.department}
                  </p>
                ) : null}
              </div>

              {shortBio ? (
                <p className="max-w-2xl text-base leading-relaxed text-slate-700">
                  {shortBio}
                </p>
              ) : null}

              {experienceLabel ? (
                <p className="text-sm font-medium text-slate-600">
                  <span className="font-semibold text-[#075f3f]">
                    {experienceLabel}
                  </span>{" "}
                  of professional experience
                </p>
              ) : null}

              <div className="flex flex-wrap gap-3 pt-1">
                {member.email?.trim() ? (
                  <a
                    href={`mailto:${member.email.trim()}`}
                    className="inline-flex items-center gap-2 rounded-full bg-[#075f3f] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(7,95,63,0.25)] transition-all hover:-translate-y-0.5 hover:bg-[#064d32] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075f3f]"
                  >
                    <Mail className="h-4 w-4" aria-hidden />
                    Email
                  </a>
                ) : null}
                {linkedInUrl ? (
                  <a
                    href={linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-5 py-2.5 text-sm font-semibold text-[#075f3f] shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075f3f]"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden />
                    LinkedIn
                  </a>
                ) : null}
                <Link
                  href="/careers#team"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:text-[#075f3f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075f3f]"
                >
                  <Users className="h-4 w-4" aria-hidden />
                  View all team
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Qualifications */}
      {qualifications.length ? (
        <section className="homepage-section-reveal w-full border-t border-emerald-100/60 bg-white py-12 md:py-16">
          <Container>
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Qualifications
            </h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {qualifications.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 rounded-2xl border border-emerald-100/80 bg-[#f7fbf8] p-4 shadow-[0_4px_16px_rgba(7,95,63,0.06)] transition-shadow hover:shadow-[0_8px_24px_rgba(7,95,63,0.1)]"
                >
                  <span
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#075f3f] text-white"
                    aria-hidden
                  >
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  <span className="text-sm leading-relaxed text-slate-700 md:text-base">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {/* Expertise */}
      {expertise.length ? (
        <section className="homepage-section-reveal w-full bg-[#f7fbf8] py-12 md:py-16">
          <Container>
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Areas of Expertise
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
              {expertise.map((item) => (
                <span
                  key={item}
                  className="inline-flex rounded-2xl border border-emerald-200/80 bg-white px-4 py-2.5 text-sm font-semibold text-[#075f3f] shadow-sm transition-colors hover:border-emerald-300 hover:bg-emerald-50"
                >
                  {item}
                </span>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* Professional profile */}
      {showProfessionalProfile && fullBio ? (
        <section className="homepage-section-reveal w-full border-t border-emerald-100/60 bg-white py-12 md:py-16">
          <Container>
            <div className="mx-auto max-w-3xl">
              <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Professional Profile
              </h2>
              <div className="mt-6 rounded-2xl border border-emerald-100/80 bg-[#f7fbf8] p-6 md:p-8">
                <p className="whitespace-pre-line text-base leading-relaxed text-slate-700 md:text-lg md:leading-8">
                  {fullBio}
                </p>
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      {/* Contact CTA */}
      <section className="homepage-section-reveal relative w-full overflow-hidden bg-[#052f21] py-16 text-white md:py-20">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.08),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.05),transparent_40%)]"
        />
        <Container className="relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Want to connect with our team?
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-emerald-50/90 md:text-base">
              Get in touch with UESPAK for engineering, automation and agriculture
              solutions.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/contact-us"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#075f3f] shadow-[0_16px_32px_rgba(0,0,0,0.22)] transition-all hover:-translate-y-0.5 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Contact Us
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              {member.email?.trim() ? (
                <a
                  href={`mailto:${member.email.trim()}`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <Mail className="h-4 w-4" aria-hidden />
                  Email
                </a>
              ) : null}
            </div>
          </div>
        </Container>
      </section>

      {/* Related team */}
      {relatedMembers.length ? (
        <section className="homepage-section-reveal w-full bg-[#f7fbf8] py-12 md:py-16 lg:py-20">
          <Container>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#075f3f]">
                  Our Experts
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                  Meet More Experts
                </h2>
              </div>
              <Link
                href="/careers#team"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#075f3f] transition-colors hover:text-[#064d32]"
              >
                View all team
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedMembers.map((related) => (
                <TeamMemberCard key={related.id} member={related} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}
