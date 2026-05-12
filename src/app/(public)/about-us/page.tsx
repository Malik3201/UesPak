import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  Leaf,
  Settings2,
  ShieldCheck,
  Target,
  UsersRound,
} from "lucide-react";
import Container from "@/components/shared/Container";
import PublicPageHero from "@/components/public/pages/PublicPageHero";
import { getAboutPageContent, getPageSeoMetadata } from "@/lib/page-content";
import { SITE_URL } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { pageContent } = await getAboutPageContent();
  return getPageSeoMetadata(pageContent);
}

export default async function AboutUsPage() {
  const { pageContent: page } = await getAboutPageContent();
  const s = page.sections;
  const overviewImage = s.overview.image?.url?.trim();
  const storyImage = s.story.image?.url?.trim();
  const ctaImage = s.cta.backgroundImage?.url?.trim();

  const aboutJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: page.seo.metaTitle || page.hero.title || "About UESPAK",
    description: page.seo.metaDescription || page.hero.description,
    url: `${SITE_URL}/about-us`,
  };

  return (
    <>
      <PublicPageHero
        hero={page.hero}
        fallbackEyebrow="About UESPAK"
        fallbackTitle="About UESPAK"
        fallbackDescription="Delivering reliable engineering, automation, facility management and agriculture-focused solutions for modern sectors."
      />

      {s.overview.isActive ? (
        <section className="homepage-section-reveal bg-white py-16 md:py-20 lg:py-24">
          <Container>
            <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#075f3f]">
                  {s.overview.eyebrow || "Company Overview"}
                </p>
                <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl">
                  {s.overview.title}
                </h2>
                <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                  {s.overview.description}
                </p>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {s.overview.highlights.map((highlight) => (
                    <div key={highlight} className="flex items-start gap-3 rounded-2xl border border-emerald-900/5 bg-[#f7fbf8] p-4">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-[#075f3f]" />
                      <span className="text-sm font-semibold text-foreground">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative overflow-hidden rounded-3xl border border-emerald-900/5 bg-[#f7fbf8] shadow-[0_24px_54px_rgba(7,95,63,0.10)]">
                {overviewImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={overviewImage} alt={s.overview.image?.altText || s.overview.title || "UESPAK overview"} className="h-[360px] w-full object-cover md:h-[460px]" />
                ) : (
                  <div className="grid h-[360px] place-items-center bg-[radial-gradient(circle_at_50%_35%,rgba(7,95,63,0.12),transparent_65%)] p-8 text-center md:h-[460px]">
                    <div>
                      <Settings2 className="mx-auto h-12 w-12 text-[#075f3f]" />
                      <p className="mt-4 text-lg font-bold text-foreground">Engineering Capability</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      {s.story.isActive ? (
        <section className="homepage-section-reveal bg-[#f7fbf8] py-16 md:py-20 lg:py-24">
          <Container>
            <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              <div className="relative order-2 overflow-hidden rounded-3xl bg-white shadow-[0_24px_54px_rgba(7,95,63,0.10)] lg:order-1">
                {storyImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={storyImage} alt={s.story.image?.altText || s.story.title || "UESPAK story"} className="h-[360px] w-full object-cover md:h-[430px]" />
                ) : (
                  <div className="flex h-[360px] items-center justify-center bg-[#052f21] p-8 text-white md:h-[430px]">
                    <p className="max-w-sm text-center text-2xl font-extrabold">Built on engineering discipline and reliable execution.</p>
                  </div>
                )}
              </div>
              <div className="order-1 lg:order-2">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#075f3f]">
                  {s.story.eyebrow || "Our Story"}
                </p>
                <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl">
                  {s.story.title}
                </h2>
                <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                  {s.story.description}
                </p>
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      {s.visionMission.isActive ? (
        <section className="homepage-section-reveal bg-white py-16 md:py-20 lg:py-24">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#075f3f]">
                {s.visionMission.eyebrow || "Our Purpose"}
              </p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl">
                {s.visionMission.title || "Vision, Mission and Values"}
              </h2>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                [Eye, s.visionMission.visionTitle, s.visionMission.visionDescription],
                [Target, s.visionMission.missionTitle, s.visionMission.missionDescription],
                [ShieldCheck, s.visionMission.valuesTitle, s.visionMission.valuesDescription],
              ].map(([Icon, title, desc], idx) => {
                const IconComponent = Icon as typeof Eye;
                return (
                  <article key={idx} className="homepage-card-rise rounded-3xl border border-emerald-900/5 bg-[#f7fbf8] p-6 shadow-[0_14px_32px_rgba(7,95,63,0.07)]">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-[#075f3f] shadow-sm">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-xl font-bold text-foreground">{String(title || "")}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{String(desc || "")}</p>
                  </article>
                );
              })}
            </div>
          </Container>
        </section>
      ) : null}

      {s.capabilities.isActive ? (
        <section className="homepage-section-reveal bg-[#052f21] py-16 text-white md:py-20 lg:py-24">
          <Container>
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-100">{s.capabilities.eyebrow || "Capabilities"}</p>
              <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">{s.capabilities.title}</h2>
              <p className="mt-4 text-emerald-50/85">{s.capabilities.description}</p>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {s.capabilities.items.map((item, idx) => (
                <article key={`${item.title}-${idx}`} className="homepage-card-rise rounded-3xl border border-white/15 bg-white/[0.08] p-6 backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white/[0.12]">
                  <Leaf className="h-7 w-7 text-emerald-200" />
                  <h3 className="mt-4 text-lg font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-emerald-50/82">{item.description}</p>
                </article>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {s.whyChoose.isActive ? (
        <section className="homepage-section-reveal bg-white py-16 md:py-20 lg:py-24">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#075f3f]">{s.whyChoose.eyebrow || "Why UESPAK"}</p>
              <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">{s.whyChoose.title}</h2>
              <p className="mt-4 text-muted-foreground">{s.whyChoose.description}</p>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {s.whyChoose.items.map((item, idx) => (
                <article key={`${item.title}-${idx}`} className="homepage-card-rise rounded-3xl border border-emerald-900/5 bg-[#f7fbf8] p-6 transition hover:-translate-y-1 hover:border-emerald-300 hover:bg-white hover:shadow-[0_20px_42px_rgba(7,95,63,0.12)]">
                  <UsersRound className="h-6 w-6 text-[#075f3f]" />
                  <h3 className="mt-4 font-bold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                </article>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {s.cta.isActive ? (
        <section
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
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-100">{s.cta.eyebrow || "Work With UESPAK"}</p>
              <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">{s.cta.title}</h2>
              <p className="mt-4 text-emerald-50/85">{s.cta.description}</p>
              {s.cta.buttonText && s.cta.buttonUrl ? (
                <Link href={s.cta.buttonUrl} className="group mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#075f3f] shadow-lg transition hover:-translate-y-0.5">
                  {s.cta.buttonText}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
              ) : null}
            </div>
          </Container>
        </section>
      ) : null}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }} />
    </>
  );
}
