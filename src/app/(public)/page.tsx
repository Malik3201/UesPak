import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { SITE_URL, buildOrganizationJsonLd, buildMetadata } from "@/lib/seo";
import Container from "@/components/shared/Container";
import HomeHero from "@/components/public/home/HomeHero";
import OurStorySection from "@/components/public/home/OurStorySection";
import FeaturedServicesSection from "@/components/public/home/FeaturedServicesSection";
import ServicesOverviewSection from "@/components/public/home/ServicesOverviewSection";
import VisionMissionSection from "@/components/public/home/VisionMissionSection";
import FeaturedProjectsSection from "@/components/public/home/FeaturedProjectsSection";
import { getPublicHomePage } from "@/lib/home-page";
import { getPublicSiteSettings } from "@/lib/site-settings";

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
  const [home, settings] = await Promise.all([
    getPublicHomePage(),
    getPublicSiteSettings(),
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

          {home.stats.isActive && statItems.length ? (
            <section className="space-y-5 rounded-3xl bg-[#072f21] p-6 text-white md:p-8">
              <h2 className="text-3xl font-bold text-white">{home.stats.title || "Stats"}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statItems.map((item, idx) => (
                  <article
                    key={`stat-${idx}`}
                    className="rounded-2xl border border-white/15 bg-white/10 p-5 text-center backdrop-blur-sm"
                  >
                      <p className="text-3xl font-bold text-white">
                      {item.value}
                      {item.suffix || ""}
                    </p>
                      <p className="mt-1 text-sm font-medium text-emerald-50">{item.label}</p>
                      {item.description ? (
                      <p className="mt-1 text-xs text-emerald-100/85">{item.description}</p>
                      ) : null}
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {home.whyChooseUs.isActive && whyChooseItems.length ? (
            <section className="space-y-6">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#075f3f]">
                  Why UESPAK
                </p>
                <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
                  {home.whyChooseUs.title || "Why Choose UESPAK"}
                </h2>
                {home.whyChooseUs.description ? (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                    {home.whyChooseUs.description}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {whyChooseItems.map((item, idx) => (
                  <article
                    key={`why-item-${idx}`}
                    className="rounded-2xl bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.08)] ring-1 ring-black/5"
                  >
                    <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#e7f4ed] text-[#075f3f]">
                      <CheckCircle2 className="h-5 w-5" />
                    </span>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {home.industries.isActive && industryItems.length ? (
            <section className="space-y-6 rounded-3xl bg-[#edf7f1] p-6 md:p-8">
              <h2 className="text-3xl font-bold text-foreground">
                {home.industries.title || "Industries We Serve"}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {industryItems.map((item, idx) => (
                  <article
                    key={`industry-${idx}`}
                    className="group rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#e2f2e8] text-xs font-semibold text-[#075f3f]">
                        {(item.name || "I").slice(0, 1).toUpperCase()}
                      </div>
                      <h3 className="font-semibold text-foreground">{item.name}</h3>
                      {item.description ? (
                      <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                      ) : null}
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {home.teamPreview.isActive ? (
            <section className="rounded-2xl border border-dashed border-[#8dbca3] bg-[#f5faf7] p-7 text-center">
              <h2 className="text-xl font-semibold text-foreground">
                {home.teamPreview.title || "Our Experts"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {home.teamPreview.description ||
                  "Team showcase module can be expanded as Team CMS evolves."}
              </p>
            </section>
          ) : null}

          {home.clients.isActive && clientLogos.length ? (
            <section className="space-y-5">
              <h2 className="text-3xl font-bold text-foreground">
                {home.clients.title || "Trusted By"}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {clientLogos.map((client, idx) => (
                  <article
                    key={`client-${idx}`}
                    className="group rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md"
                  >
                      {client.logo?.url ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={client.logo.url}
                          alt={client.logo.altText || client.name}
                          className="mx-auto h-14 w-auto object-contain grayscale transition group-hover:grayscale-0"
                          loading="lazy"
                        />
                        </>
                      ) : (
                        <p className="text-center text-sm font-semibold text-foreground">{client.name}</p>
                      )}
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {home.profileCTA.isActive || home.contactCTA.isActive ? (
            <section className="grid gap-4 md:grid-cols-2">
              {home.profileCTA.isActive ? (
                <div className="rounded-2xl bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.08)] ring-1 ring-black/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#075f3f]">
                    {home.profileCTA.eyebrow || "Company Profile"}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-foreground">{home.profileCTA.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{home.profileCTA.description}</p>
                  {settings.profilePdfUrl ? (
                    <a
                      href={settings.profilePdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1 rounded-lg bg-[#075f3f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#03452e] transition-colors"
                    >
                      {home.profileCTA.buttonText || settings.profileButtonText || "Download Profile"}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>
              ) : null}
              {home.contactCTA.isActive ? (
                <div className="rounded-2xl bg-gradient-to-br from-[#075f3f] to-[#0c704b] p-6 text-white shadow-[0_16px_36px_rgba(3,69,46,0.35)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
                    {home.contactCTA.eyebrow || "Let's Work Together"}
                  </p>
                  <h3 className="text-xl font-semibold">{home.contactCTA.title}</h3>
                  <p className="mt-2 text-sm text-emerald-50">{home.contactCTA.description}</p>
                  <Link href={home.contactCTA.buttonUrl || "/contact-us"} className="mt-4 inline-flex items-center gap-1 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#075f3f] hover:bg-emerald-50 transition-colors">
                    {home.contactCTA.buttonText || "Contact Us"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : null}
            </section>
          ) : null}
        </Container>
      </section>

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
