import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, GraduationCap, ShieldCheck } from "lucide-react";
import Container from "@/components/shared/Container";
import CareersOpenPositions from "@/components/public/careers/CareersOpenPositions";
import CareersTeamSection from "@/components/public/careers/CareersTeamSection";
import { getPublishedJobs } from "@/lib/jobs";
import { getPublishedTeamMembers } from "@/lib/team";
import { getPublicSiteSettings } from "@/lib/site-settings";
import PublicPageHero from "@/components/public/pages/PublicPageHero";
import { getCareersPageContent, getPageSeoMetadata } from "@/lib/page-content";
import { getSeoSettings } from "@/lib/seo-settings";
import { SITE_URL } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  await getSeoSettings();
  const { pageContent } = await getCareersPageContent();
  return getPageSeoMetadata(pageContent);
}

export default async function CareersPage() {
  const [{ pageContent: page }, members, jobs, settings] = await Promise.all([
    getCareersPageContent(),
    getPublishedTeamMembers(),
    getPublishedJobs(),
    getPublicSiteSettings(),
  ]);
  const careersEmail =
    page.sections.applyCTA.email?.trim() || settings.primaryEmail?.trim();
  const s = page.sections;
  const introImage = s.intro.image?.url?.trim();
  const ctaImage = s.applyCTA.backgroundImage?.url?.trim();
  const applyHref =
    s.applyCTA.buttonUrl?.trim() ||
    (s.applyCTA.email ? `mailto:${s.applyCTA.email}` : "/contact-us");

  const careersJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.seo.metaTitle || page.hero.title || "Careers at UESPAK",
    description: page.seo.metaDescription || page.hero.description,
    url: `${SITE_URL}/careers`,
  };

  return (
    <>
      <PublicPageHero
        hero={page.hero}
        fallbackEyebrow="Careers"
        fallbackTitle="Careers at UESPAK"
        fallbackDescription="Join a team focused on engineering excellence, technical reliability and practical solutions for modern industries."
      />

      {s.intro.isActive ? (
        <section className="homepage-section-reveal bg-white py-16 md:py-20 lg:py-24">
          <Container>
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#075f3f]">{s.intro.eyebrow || "Why UESPAK"}</p>
                <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl">{s.intro.title}</h2>
                <p className="mt-5 text-base leading-relaxed text-muted-foreground">{s.intro.description}</p>
              </div>
              <div className="overflow-hidden rounded-3xl bg-[#f7fbf8] shadow-[0_24px_54px_rgba(7,95,63,0.10)]">
                {introImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={introImage} alt={s.intro.image?.altText || s.intro.title || "Careers at UESPAK"} className="h-[360px] w-full object-cover md:h-[440px]" />
                ) : (
                  <div className="flex h-[360px] items-center justify-center bg-[radial-gradient(circle_at_50%_35%,rgba(7,95,63,0.12),transparent_65%)] p-8 md:h-[440px]">
                    <BriefcaseBusiness className="h-16 w-16 text-[#075f3f]" />
                  </div>
                )}
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      {s.whyWork.isActive ? (
        <section className="homepage-section-reveal bg-[#f7fbf8] py-16 md:py-20 lg:py-24">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#075f3f]">{s.whyWork.eyebrow || "Why Work With Us"}</p>
              <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">{s.whyWork.title}</h2>
              <p className="mt-4 text-muted-foreground">{s.whyWork.description}</p>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {s.whyWork.items.map((item, idx) => (
                <article key={`${item.title}-${idx}`} className="homepage-card-rise rounded-3xl border border-emerald-900/5 bg-white p-6 shadow-[0_12px_28px_rgba(7,95,63,0.06)] transition hover:-translate-y-1 hover:border-emerald-300">
                  <GraduationCap className="h-7 w-7 text-[#075f3f]" />
                  <h3 className="mt-4 font-bold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </article>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {s.culture.isActive ? (
        <section className="homepage-section-reveal bg-[#052f21] py-16 text-white md:py-20 lg:py-24">
          <Container>
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-100">{s.culture.eyebrow || "Our Culture"}</p>
              <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">{s.culture.title}</h2>
              <p className="mt-4 text-emerald-50/85">{s.culture.description}</p>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {s.culture.values.map((item, idx) => (
                <article key={`${item.title}-${idx}`} className="homepage-card-rise rounded-3xl border border-white/15 bg-white/[0.08] p-6 backdrop-blur-sm">
                  <ShieldCheck className="h-7 w-7 text-emerald-200" />
                  <h3 className="mt-4 font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-emerald-50/82">{item.description}</p>
                </article>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      <CareersOpenPositions jobs={jobs} careersEmail={careersEmail} />

      {s.teamIntro.isActive && s.teamIntro.showTeamMembers ? (
        <div id="team">
          <CareersTeamSection
            members={members}
            eyebrow={s.teamIntro.eyebrow}
            title={s.teamIntro.title}
            description={s.teamIntro.description}
          />
        </div>
      ) : null}

      {s.applyCTA.isActive ? (
        <section
          id="apply"
          className="homepage-section-reveal bg-[#052f21] py-16 text-white md:py-20"
          style={{
            backgroundImage: ctaImage
              ? `linear-gradient(135deg, rgba(3,39,28,0.88), rgba(5,47,33,0.78)), url("${ctaImage}")`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-100">{s.applyCTA.eyebrow || "Apply"}</p>
              <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">{s.applyCTA.title}</h2>
              <p className="mt-4 text-emerald-50/85">{s.applyCTA.description}</p>
              <Link href={applyHref} className="group mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#075f3f] shadow-lg transition hover:-translate-y-0.5">
                {s.applyCTA.buttonText || "Email Your Resume"}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
            </div>
          </Container>
        </section>
      ) : null}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(careersJsonLd) }} />
    </>
  );
}
