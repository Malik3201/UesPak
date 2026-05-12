import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Clock3,
  Cpu,
  Download,
  Factory,
  FileText,
  FlaskConical,
  HeartPulse,
  Leaf,
  Settings2,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  UsersRound,
  Wheat,
  Zap,
} from "lucide-react";
import { SITE_URL, buildOrganizationJsonLd, buildMetadata } from "@/lib/seo";
import Container from "@/components/shared/Container";
import HomeHero from "@/components/public/home/HomeHero";
import OurStorySection from "@/components/public/home/OurStorySection";
import FeaturedServicesSection from "@/components/public/home/FeaturedServicesSection";
import ServicesOverviewSection from "@/components/public/home/ServicesOverviewSection";
import VisionMissionSection from "@/components/public/home/VisionMissionSection";
import FeaturedProjectsSection from "@/components/public/home/FeaturedProjectsSection";
import HomeTeamSection from "@/components/public/home/HomeTeamSection";
import HomeLocationSection from "@/components/public/home/HomeLocationSection";
import IndustriesMobileCarousel from "@/components/public/home/IndustriesMobileCarousel";
import ClientsMobileMarquee from "@/components/public/home/ClientsMobileMarquee";
import { getPublicHomePage } from "@/lib/home-page";
import { getPublicSiteSettings } from "@/lib/site-settings";
import { getFeaturedTeamMembers } from "@/lib/team";

const whyIcons = [
  ShieldCheck,
  Clock3,
  Settings2,
  Leaf,
  UsersRound,
  TrendingUp,
];

function getIndustryIcon(name: string) {
  const value = name.toLowerCase();

  if (value.includes("health")) return HeartPulse;
  if (value.includes("pharma")) return FlaskConical;
  if (value.includes("industrial") || value.includes("facility")) return Factory;
  if (value.includes("commercial") || value.includes("building")) return Building2;
  if (value.includes("agri")) return Wheat;
  if (value.includes("energy") || value.includes("utilit")) return Zap;
  if (value.includes("automation") || value.includes("control")) return Cpu;
  if (value.includes("fmcg") || value.includes("retail")) return Store;

  return Building2;
}

function clampOverlay(value: number | undefined, fallback: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.min(0.95, Math.max(0.25, value));
}

function sectionBackgroundStyle(
  imageUrl: string | undefined,
  overlayOpacity: number,
  fallbackGradient: string
): CSSProperties {
  if (!imageUrl) {
    return { backgroundImage: fallbackGradient };
  }

  return {
    backgroundImage: `linear-gradient(135deg, rgba(3, 39, 28, ${overlayOpacity}), rgba(5, 47, 33, ${Math.min(
      0.96,
      overlayOpacity + 0.12
    )})), url("${imageUrl}")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const home = await getPublicHomePage();
  const base = buildMetadata({
    title: "UESPAK | Engineering, Automation & Agriculture Solutions",
    description:
      "UESPAK provides engineering, HVAC-R, facility management, industrial automation, and agriculture solutions for modern commercial and industrial sectors.",
    canonicalPath: "/",
  });

  const seo = home.seo || {};
  const ogImage =
    typeof seo.ogImage === "object" ? seo.ogImage?.url : undefined;

  return {
    ...base,
    title: seo.metaTitle?.trim() || base.title,
    description: seo.metaDescription?.trim() || base.description,
    keywords: seo.keywords?.length ? seo.keywords : base.keywords,
    alternates: {
      canonical: seo.canonicalUrl?.trim() || `${SITE_URL}/`,
    },
    openGraph: {
      ...base.openGraph,
      title: seo.ogTitle?.trim() || seo.metaTitle?.trim() || "UESPAK",
      description:
        seo.ogDescription?.trim() ||
        seo.metaDescription?.trim() ||
        String(base.description || ""),
      images: ogImage
        ? [{ url: ogImage, alt: seo.metaTitle || "UESPAK" }]
        : base.openGraph?.images,
    },
    twitter: {
      ...base.twitter,
      title: seo.ogTitle?.trim() || seo.metaTitle?.trim() || "UESPAK",
      description:
        seo.ogDescription?.trim() ||
        seo.metaDescription?.trim() ||
        String(base.description || ""),
      images: ogImage ? [ogImage] : (base.twitter?.images as string[] | undefined),
    },
    robots: {
      index: seo.robots?.index !== false,
      follow: seo.robots?.follow !== false,
    },
  };
}

export default async function HomePage() {
  const [home, settings, featuredTeam] = await Promise.all([
    getPublicHomePage(),
    getPublicSiteSettings(),
    getFeaturedTeamMembers(),
  ]);

  const whyChooseItems = [...(home.whyChooseUs.items || [])]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((item) => ({
      ...item,
      description:
        item.description?.trim() ||
        "Structured delivery approach aligned with quality and long-term reliability.",
    }));

  const industryItems = [...(home.industries.items || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );
  const statItems = [...(home.stats.items || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );
  const clientLogos = [...(home.clients.logos || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );
  const statsBackgroundUrl = home.stats.backgroundImage?.url?.trim() || undefined;
  const statsOverlayOpacity = clampOverlay(home.stats.overlayOpacity, 0.78);
  const industriesBackgroundUrl =
    home.industries.backgroundImage?.url?.trim() || undefined;
  const industriesOverlayOpacity = clampOverlay(home.industries.overlayOpacity, 0.72);
  const ctaBackgroundUrl =
    home.contactCTA.backgroundImage?.url?.trim() || undefined;
  const ctaOverlayOpacity = clampOverlay(home.contactCTA.overlayOpacity, 0.8);
  const contactCardBackgroundUrl =
    home.contactCTA.cardBackgroundImage?.url?.trim() || undefined;
  const contactCardOverlayOpacity = clampOverlay(
    home.contactCTA.cardOverlayOpacity,
    0.72
  );
  const profilePdfUrl =
    home.profileCTA.profilePdf?.url?.trim() ||
    settings.profilePdfUrl?.trim() ||
    undefined;

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.siteName || "UESPAK",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/services`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      {home.hero.isActive ? <HomeHero hero={home.hero} /> : null}

      <OurStorySection />

      {home.featuredServices.isActive && home.featuredServicesResolved.length ? (
        <FeaturedServicesSection
          section={home.featuredServices}
          services={home.featuredServicesResolved}
        />
      ) : null}

      <section className="section-py bg-[linear-gradient(to_bottom,#ffffff_0%,#f7fbf8_100%)]">
        <Container className="space-y-16">
          {home.servicesOverview.isActive ? (
            <ServicesOverviewSection section={home.servicesOverview} />
          ) : null}
        </Container>
      </section>

      {home.featuredProjects.isActive && home.featuredProjectsResolved.length ? (
        <FeaturedProjectsSection
          section={home.featuredProjects}
          projects={home.featuredProjectsResolved}
        />
      ) : null}

      <section className="section-py bg-[linear-gradient(to_bottom,#f7fbf8_0%,#ffffff_100%)]">
        <Container className="space-y-16">
          {home.aboutPreview.isActive ? (
            <section className="grid gap-7 rounded-3xl bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.08)] ring-1 ring-black/5 md:grid-cols-2 md:p-8">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#075f3f]">
                  About Company
                </p>
                <h2 className="text-3xl font-bold text-foreground md:text-4xl">
                  {home.aboutPreview.title || "About UESPAK"}
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {home.aboutPreview.description}
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  <span className="rounded-lg bg-[#edf7f1] px-3 py-2 text-xs font-medium text-[#075f3f]">
                    Multi-Sector Expertise
                  </span>
                  <span className="rounded-lg bg-[#edf7f1] px-3 py-2 text-xs font-medium text-[#075f3f]">
                    Engineering + Agriculture
                  </span>
                  <span className="rounded-lg bg-[#edf7f1] px-3 py-2 text-xs font-medium text-[#075f3f]">
                    Technical Project Support
                  </span>
                </div>
                {home.aboutPreview.buttonText && home.aboutPreview.buttonUrl ? (
                  <Link
                    href={home.aboutPreview.buttonUrl}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#075f3f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#03452e] transition-colors"
                  >
                    {home.aboutPreview.buttonText}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
              <div>
                {home.aboutPreview.image?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={home.aboutPreview.image.url}
                    alt={home.aboutPreview.image.altText || "About UESPAK"}
                    className="h-full min-h-80 w-full rounded-2xl object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full min-h-80 rounded-2xl bg-gradient-to-br from-[#cde9da] to-[#eaf6f0]" />
                )}
              </div>
            </section>
          ) : null}

          {home.visionMission.isActive ? (
            <VisionMissionSection section={home.visionMission} />
          ) : null}
        </Container>
      </section>

      {home.stats.isActive && statItems.length ? (
        <section
          className="homepage-section-reveal relative overflow-hidden bg-[#052f21] py-14 text-white md:py-[4.5rem] lg:py-20"
          style={sectionBackgroundStyle(
            statsBackgroundUrl,
            statsOverlayOpacity,
            "linear-gradient(135deg,#052f21 0%,#075f3f 52%,#03271c 100%)"
          )}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[#052f21]/20"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.16]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute -left-24 top-8 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[#d7b56d]/15 blur-3xl"
          />
          <Container className="relative">
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-200">
                  Performance Snapshot
                </p>
                <h2 className="mt-3 text-balance text-3xl font-extrabold leading-tight text-white md:text-4xl">
                  {home.stats.title || "Achievements Built on Reliable Delivery"}
                </h2>
                {home.stats.description ? (
                  <p className="mt-4 text-sm leading-relaxed text-emerald-50/85 md:text-base">
                    {home.stats.description}
                  </p>
                ) : (
                  <p className="mt-4 text-sm leading-relaxed text-emerald-50/85 md:text-base">
                    Focused engineering, automation and agriculture capabilities
                    supported by disciplined execution and long-term client trust.
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {statItems.map((item, idx) => (
                  <article
                    key={`stat-${idx}`}
                    className="homepage-card-rise group rounded-3xl border border-white/15 bg-white/[0.08] p-5 shadow-[0_18px_42px_rgba(0,0,0,0.18)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200/45 hover:bg-white/[0.12]"
                    style={{ animationDelay: `${idx * 90}ms` }}
                  >
                    <p className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                      {item.value}
                      {item.suffix || ""}
                    </p>
                    <p className="mt-2 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-100">
                      {item.label}
                    </p>
                    {item.description ? (
                      <p className="mt-2 text-sm leading-relaxed text-emerald-50/80">
                        {item.description}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      {home.whyChooseUs.isActive && whyChooseItems.length ? (
        <section className="homepage-section-reveal bg-[linear-gradient(180deg,#ffffff_0%,#f4fbf7_100%)] py-14 md:py-20 lg:py-24">
          <Container>
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
              <div className="max-w-2xl lg:sticky lg:top-28">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#075f3f]">
                  {home.whyChooseUs.eyebrow || "Why Choose UESPAK"}
                </p>
                <h2 className="mt-3 text-balance text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl">
                  {home.whyChooseUs.title ||
                    "Reliable Engineering Support for Modern Sectors"}
                </h2>
                {home.whyChooseUs.description ? (
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                    {home.whyChooseUs.description}
                  </p>
                ) : (
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                    Practical technical capability, responsible delivery and
                    responsive support across complex operational environments.
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {whyChooseItems.map((item, idx) => {
                  const Icon = whyIcons[idx % whyIcons.length];

                  return (
                    <article
                      key={`why-item-${idx}`}
                      className="homepage-card-rise group relative overflow-hidden rounded-3xl border border-emerald-900/5 bg-white p-5 shadow-[0_14px_32px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-[0_24px_46px_rgba(7,95,63,0.16)]"
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      <div
                        aria-hidden="true"
                        className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-100/70 transition-transform duration-500 group-hover:scale-125"
                      />
                      <span className="relative mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e7f4ed] text-[#075f3f] transition-all duration-300 group-hover:scale-105 group-hover:bg-[#075f3f] group-hover:text-white">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <h3 className="relative text-base font-bold text-foreground">
                        {item.title}
                      </h3>
                      <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      {home.teamPreview.isActive && featuredTeam.length ? (
        <HomeTeamSection
          section={home.teamPreview}
          members={featuredTeam}
        />
      ) : null}

      {home.industries.isActive && industryItems.length ? (
        <section
          className={[
            "homepage-section-reveal relative overflow-hidden py-14 md:py-20 lg:py-24",
            industriesBackgroundUrl ? "bg-[#052f21] text-white" : "bg-white",
          ].join(" ")}
          style={sectionBackgroundStyle(
            industriesBackgroundUrl,
            industriesOverlayOpacity,
            "linear-gradient(180deg,#ffffff 0%,#f7fbf8 100%)"
          )}
        >
          {industriesBackgroundUrl ? (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-b from-[#052f21]/20 via-[#052f21]/35 to-[#052f21]/65"
            />
          ) : null}
          <Container>
            <div className="relative mx-auto max-w-3xl text-center">
              <p
                className={[
                  "text-xs font-semibold uppercase tracking-[0.32em]",
                  industriesBackgroundUrl ? "text-emerald-100" : "text-[#075f3f]",
                ].join(" ")}
              >
                Sector Coverage
              </p>
              <h2
                className={[
                  "mt-3 text-balance text-3xl font-extrabold leading-tight tracking-tight md:text-4xl",
                  industriesBackgroundUrl ? "text-white" : "text-foreground",
                ].join(" ")}
              >
                {home.industries.title || "Industries We Serve"}
              </h2>
              {home.industries.description ? (
                <p
                  className={[
                    "mt-4 text-sm leading-relaxed md:text-base",
                    industriesBackgroundUrl
                      ? "text-emerald-50/85"
                      : "text-muted-foreground",
                  ].join(" ")}
                >
                  {home.industries.description}
                </p>
              ) : null}
            </div>

            {(() => {
              const industryCards = industryItems.map((item, idx) => {
                const IndustryIcon = getIndustryIcon(item.name);
                return (
                  <article
                    key={`industry-${idx}`}
                    className={[
                      "homepage-card-rise group relative h-full overflow-hidden rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1",
                      industriesBackgroundUrl
                        ? "border border-white/15 bg-white/[0.12] text-white shadow-[0_18px_42px_rgba(0,0,0,0.18)] backdrop-blur-sm hover:border-emerald-100/45 hover:bg-white/[0.16]"
                        : "border border-emerald-900/5 bg-[#f7fbf8] shadow-[0_10px_24px_rgba(15,23,42,0.05)] hover:border-emerald-300 hover:bg-white hover:shadow-[0_22px_42px_rgba(7,95,63,0.14)]",
                    ].join(" ")}
                    style={{ animationDelay: `${idx * 65}ms` }}
                  >
                    <div
                      className={[
                        "mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition-all duration-300 group-hover:scale-105",
                        industriesBackgroundUrl
                          ? "bg-white text-[#075f3f] ring-1 ring-white/20 group-hover:bg-emerald-100"
                          : "bg-white text-[#075f3f] ring-1 ring-emerald-900/5 group-hover:bg-[#075f3f] group-hover:text-white",
                      ].join(" ")}
                    >
                      {item.icon ? (
                        <span className="text-sm font-extrabold" aria-hidden="true">
                          {item.icon.slice(0, 2).toUpperCase()}
                        </span>
                      ) : (
                        <IndustryIcon className="h-5 w-5" aria-hidden="true" />
                      )}
                    </div>
                    <h3
                      className={
                        industriesBackgroundUrl
                          ? "font-bold text-white"
                          : "font-bold text-foreground"
                      }
                    >
                      {item.name}
                    </h3>
                    {item.description ? (
                      <p
                        className={[
                          "mt-2 line-clamp-3 text-sm leading-relaxed",
                          industriesBackgroundUrl
                            ? "text-emerald-50/82"
                            : "text-muted-foreground",
                        ].join(" ")}
                      >
                        {item.description}
                      </p>
                    ) : (
                      <p
                        className={[
                          "mt-2 text-sm leading-relaxed",
                          industriesBackgroundUrl
                            ? "text-emerald-50/82"
                            : "text-muted-foreground",
                        ].join(" ")}
                      >
                        Integrated technical support for sector-specific
                        operational needs.
                      </p>
                    )}
                  </article>
                );
              });

              return (
                <>
                  <IndustriesMobileCarousel className="mt-10 sm:hidden">
                    {industryCards}
                  </IndustriesMobileCarousel>
                  <div className="mt-10 hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4">
                    {industryCards}
                  </div>
                </>
              );
            })()}
          </Container>
        </section>
      ) : null}

      {home.clients.isActive && clientLogos.length ? (
        <section className="homepage-section-reveal bg-[#f7fbf8] py-12 md:py-16 lg:py-20">
          <Container>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#075f3f]">
                  Client Confidence
                </p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                  {home.clients.title || "Trusted By"}
                </h2>
                {home.clients.description ? (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                    {home.clients.description}
                  </p>
                ) : null}
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Partners and clients across modern technical sectors.
              </p>
            </div>

            <div className="mt-8 sm:hidden">
              <ClientsMobileMarquee logos={clientLogos} />
            </div>

            <div className="mt-8 hidden gap-4 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {clientLogos.map((client, idx) => {
                const content = client.logo?.url ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={client.logo.url}
                      alt={client.logo.altText || client.name}
                      className="mx-auto h-14 w-auto object-contain transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </>
                ) : (
                  <p className="text-center text-sm font-bold text-foreground">
                    {client.name}
                  </p>
                );

                return client.url ? (
                  <a
                    key={`client-${idx}`}
                    href={client.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="homepage-card-rise group grid min-h-24 place-items-center rounded-2xl border border-emerald-900/5 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-[0_18px_34px_rgba(7,95,63,0.12)]"
                    style={{ animationDelay: `${idx * 60}ms` }}
                    aria-label={`Visit ${client.name}`}
                  >
                    {content}
                  </a>
                ) : (
                  <article
                    key={`client-${idx}`}
                    className="homepage-card-rise group grid min-h-24 place-items-center rounded-2xl border border-emerald-900/5 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-[0_18px_34px_rgba(7,95,63,0.12)]"
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    {content}
                  </article>
                );
              })}
            </div>
          </Container>
        </section>
      ) : null}

      {home.profileCTA.isActive || home.contactCTA.isActive ? (
        <section
          className="homepage-section-reveal relative overflow-hidden bg-[#052f21] py-14 text-white md:py-[4.5rem] lg:py-20"
          style={sectionBackgroundStyle(
            ctaBackgroundUrl,
            ctaOverlayOpacity,
            "linear-gradient(135deg,#052f21 0%,#075f3f 58%,#03271c 100%)"
          )}
        >
          <div aria-hidden="true" className="absolute inset-0 bg-[#052f21]/15" />
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.65) 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute -right-20 top-0 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl"
          />
          <Container className="relative">
            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
              {home.profileCTA.isActive ? (
                <article className="group relative flex min-h-[22rem] overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-[#06382a] via-[#075f3f] to-[#03261c] p-6 text-white shadow-[0_24px_48px_rgba(0,0,0,0.28)] transition-transform duration-500 hover:-translate-y-1 md:p-9">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-[0.18]"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.55) 1px, transparent 0)",
                      backgroundSize: "22px 22px",
                    }}
                  />
                  <div
                    aria-hidden="true"
                    className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-emerald-300/15 blur-2xl"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute -bottom-20 -right-12 h-56 w-56 rounded-full bg-emerald-400/15 blur-3xl"
                  />
                  <div className="relative flex h-full w-full flex-col justify-between gap-8">
                    <div>
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-emerald-100 backdrop-blur-sm">
                        <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                        {home.profileCTA.eyebrow || "Company Profile"}
                      </span>
                      <h2 className="mt-5 text-3xl font-extrabold leading-tight text-white md:text-[2.05rem]">
                        {home.profileCTA.title ||
                          "Download the UESPAK Company Profile"}
                      </h2>
                      <p className="mt-4 max-w-md text-sm leading-relaxed text-emerald-50/85 md:text-base">
                        {home.profileCTA.description ||
                          "Access our capability overview, service scope, and technical strengths in one curated PDF."}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      {profilePdfUrl ? (
                        <a
                          href={profilePdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/btn inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#075f3f] shadow-[0_14px_28px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-50"
                        >
                          <Download
                            className="h-4 w-4 transition-transform duration-300 group-hover/btn:-translate-y-0.5"
                            aria-hidden="true"
                          />
                          {home.profileCTA.buttonText ||
                            settings.profileButtonText ||
                            "Download Profile"}
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-5 py-3 text-sm font-medium text-emerald-50/90">
                          Company profile will be available soon.
                        </span>
                      )}
                      <span className="text-xs uppercase tracking-[0.22em] text-emerald-100/70">
                        PDF&nbsp;&middot;&nbsp;Updated regularly
                      </span>
                    </div>
                  </div>
                </article>
              ) : null}

              {home.contactCTA.isActive ? (
                <article className="group relative flex min-h-[22rem] overflow-hidden rounded-3xl shadow-[0_28px_56px_rgba(0,0,0,0.28)] transition-transform duration-500 hover:-translate-y-1">
                  {contactCardBackgroundUrl ? (
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.04]"
                      style={{
                        backgroundImage: `url("${contactCardBackgroundUrl}")`,
                      }}
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          "linear-gradient(135deg,#075f3f 0%,#0a8456 55%,#052f21 100%)",
                      }}
                    />
                  )}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, rgba(3,39,28,0.86) 0%, rgba(5,47,33,0.78) 45%, rgba(7,95,63,0.62) 100%)",
                      opacity: contactCardBackgroundUrl
                        ? contactCardOverlayOpacity
                        : 0.88,
                    }}
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute -right-20 -top-10 h-56 w-56 rounded-full bg-emerald-300/15 blur-3xl"
                  />
                  <div className="relative flex h-full w-full flex-col justify-between gap-8 p-6 text-white md:p-9">
                    <div>
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-emerald-100 backdrop-blur-sm">
                        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                        {home.contactCTA.eyebrow || "Let's Work Together"}
                      </span>
                      <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-white md:text-[2.15rem]">
                        {home.contactCTA.title ||
                          "Need a reliable technical partner?"}
                      </h2>
                      <p className="mt-4 max-w-xl text-sm leading-relaxed text-emerald-50/90 md:text-base">
                        {home.contactCTA.description ||
                          "Share your requirements and our team will get back with the right approach for your project."}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <Link
                        href={home.contactCTA.buttonUrl || "/contact-us"}
                        className="group/btn inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#075f3f] shadow-[0_14px_28px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-50"
                      >
                        {home.contactCTA.buttonText || "Contact Us"}
                        <ArrowRight
                          className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                          aria-hidden="true"
                        />
                      </Link>
                      <span className="text-xs uppercase tracking-[0.22em] text-emerald-100/80">
                        Engineering &middot; Automation &middot; Agriculture
                      </span>
                    </div>
                  </div>
                </article>
              ) : null}
            </div>
          </Container>
        </section>
      ) : null}

      <HomeLocationSection settings={settings} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildOrganizationJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
    </>
  );
}
