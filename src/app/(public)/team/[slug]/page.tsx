import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink, Mail, Phone } from "lucide-react";
import Container from "@/components/shared/Container";
import { buildMetadata } from "@/lib/seo";
import { getAllTeamSlugs, getTeamMemberBySlug } from "@/lib/team";

export async function generateStaticParams() {
  const slugs = await getAllTeamSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const member = await getTeamMemberBySlug(slug);
  if (!member) {
    return buildMetadata({
      title: "Team Member",
      description: "UESPAK team member profile.",
      canonicalPath: `/team/${slug}`,
    });
  }

  const seo = member.seo || {};
  const ogImage =
    typeof seo.ogImage === "object" ? seo.ogImage?.url : member.image?.url;

  return buildMetadata({
    title: seo.metaTitle?.trim() || `${member.name} | UESPAK Team`,
    description:
      seo.metaDescription?.trim() ||
      member.shortBio ||
      `${member.name}, ${member.designation} at UESPAK.`,
    canonicalPath: `/team/${member.slug}`,
    ogImage,
  });
}

export default async function TeamMemberPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const member = await getTeamMemberBySlug(slug);
  if (!member) notFound();

  return (
    <main className="section-py bg-[linear-gradient(to_bottom,#ffffff_0%,#f7fbf8_100%)]">
      <Container>
        <div className="grid gap-10 rounded-3xl bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-black/5 lg:grid-cols-[0.8fr_1.2fr] lg:p-8">
          <div>
            {member.image?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={member.image.url}
                alt={member.image.altText || member.name}
                className="aspect-[4/5] w-full rounded-3xl object-cover"
              />
            ) : (
              <div className="grid aspect-[4/5] w-full place-items-center rounded-3xl bg-emerald-50 text-5xl font-extrabold text-[#075f3f]">
                {member.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#075f3f]">
                Team Profile
              </p>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-foreground">
                {member.name}
              </h1>
              <p className="mt-2 text-lg font-semibold text-[#075f3f]">
                {member.designation}
              </p>
              {member.department ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {member.department}
                </p>
              ) : null}
            </div>

            {member.bio || member.shortBio ? (
              <p className="text-sm leading-7 text-muted-foreground md:text-base">
                {member.bio || member.shortBio}
              </p>
            ) : null}

            {member.expertise.length ? (
              <section>
                <h2 className="text-lg font-bold text-foreground">Expertise</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {member.expertise.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#075f3f]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            {member.qualifications.length ? (
              <section>
                <h2 className="text-lg font-bold text-foreground">
                  Qualifications
                </h2>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {member.qualifications.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            <div className="flex flex-wrap gap-3">
              {member.linkedinUrl ? (
                <a
                  href={member.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#075f3f] px-4 py-2 text-sm font-semibold text-white"
                >
                  <ExternalLink className="h-4 w-4" />
                  LinkedIn
                </a>
              ) : null}
              {member.email ? (
                <a
                  href={`mailto:${member.email}`}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-200 px-4 py-2 text-sm font-semibold text-[#075f3f]"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </a>
              ) : null}
              {member.phone ? (
                <a
                  href={`tel:${member.phone.replace(/\s+/g, "")}`}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-200 px-4 py-2 text-sm font-semibold text-[#075f3f]"
                >
                  <Phone className="h-4 w-4" />
                  Call
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
