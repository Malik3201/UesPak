import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { SITE_URL, buildOrganizationJsonLd, buildMetadata } from "@/lib/seo";
import Container from "@/components/shared/Container";
import { getPublicHomePage } from "@/lib/home-page";
import { getPublicSiteSettings } from "@/lib/site-settings";
import { getServiceGroupLabel } from "@/types/service";
import { getProjectGroupLabel } from "@/types/project";

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
      <section className="relative overflow-hidden bg-gradient-to-br from-[#03452e] via-[#075f3f] to-[#0a6d49] text-white">
        {home.hero.backgroundImage?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={home.hero.backgroundImage.url}
            alt={home.hero.backgroundImage.altText || "Hero background"}
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(255,255,255,0.22),transparent_42%),radial-gradient(circle_at_80%_20%,rgba(255,236,179,0.16),transparent_35%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:44px_44px] opacity-25" />
        <Container className="relative section-py !pt-16 !pb-20 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            {home.hero.eyebrow ? (
              <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
                <Sparkles className="h-3.5 w-3.5" />
                {home.hero.eyebrow}
              </p>
            ) : null}
            <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-5xl xl:text-6xl">
              {home.hero.title}
            </h1>
            {home.hero.subtitle ? (
              <p className="text-base font-semibold uppercase tracking-[0.22em] text-emerald-100">
                {home.hero.subtitle}
              </p>
            ) : null}
            {home.hero.description ? (
              <p className="max-w-2xl text-sm text-emerald-50/95 md:text-lg md:leading-relaxed">
                {home.hero.description}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-3 pt-1">
              {home.hero.primaryButtonText && home.hero.primaryButtonUrl ? (
                <Link
                  href={home.hero.primaryButtonUrl}
                  className="inline-flex h-12 items-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-[#075f3f] shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:bg-emerald-50 transition-all hover:-translate-y-0.5"
                >
                  {home.hero.primaryButtonText}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : null}
              {home.hero.secondaryButtonText && home.hero.secondaryButtonUrl ? (
                <Link
                  href={home.hero.secondaryButtonUrl}
                  className="inline-flex h-12 items-center rounded-lg border border-white/40 bg-white/5 px-6 text-sm font-semibold text-white hover:bg-white/15 transition-colors"
                >
                  {home.hero.secondaryButtonText}
                </Link>
              ) : null}
            </div>
            {home.hero.badges?.length ? (
              <div className="flex flex-wrap gap-2 pt-3">
                {home.hero.badges.map((badge, idx) => (
                  <span
                    key={`badge-${idx}`}
                    className="rounded-full border border-white/20 bg-white/8 px-3 py-1 text-xs font-medium text-emerald-50"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          <div className="relative">
            {home.hero.foregroundImage?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={home.hero.foregroundImage.url}
                alt={home.hero.foregroundImage.altText || "Hero"}
                className="mx-auto w-full max-w-xl rounded-2xl border border-white/30 object-cover shadow-[0_24px_64px_rgba(0,0,0,0.35)]"
              />
            ) : (
              <div className="mx-auto flex h-[25rem] w-full max-w-xl flex-col justify-between rounded-2xl border border-white/25 bg-white/10 p-6 backdrop-blur-sm shadow-[0_24px_64px_rgba(0,0,0,0.32)]">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-100">UESPAK</p>
                <div className="space-y-3">
                  <p className="text-2xl font-semibold leading-tight text-white">
                    Engineering and technical delivery with practical business outcomes.
                  </p>
                  <p className="text-sm text-emerald-50/90">
                    Built for reliability, compliance, and long-term operational performance.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs text-emerald-100/90">
                  <span className="rounded-md bg-white/10 px-3 py-2">Engineering</span>
                  <span className="rounded-md bg-white/10 px-3 py-2">Automation</span>
                  <span className="rounded-md bg-white/10 px-3 py-2">Agriculture</span>
                  <span className="rounded-md bg-white/10 px-3 py-2">Facility Systems</span>
                </div>
              </div>
            )}
          </div>
        </Container>
      </section>

      <section className="section-py bg-[linear-gradient(to_bottom,#ffffff_0%,#f7fbf8_100%)]">
        <Container className="space-y-16">
          {home.featuredServices.isActive && home.featuredServicesResolved.length ? (
            <section className="space-y-7">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#075f3f]">
                    Core Expertise
                  </p>
                  <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
                    {home.featuredServices.title || "Featured Services"}
                  </h2>
                  {home.featuredServices.description ? (
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
                      {home.featuredServices.description}
                    </p>
                  ) : null}
                </div>
                <Link href="/services" className="text-sm font-semibold text-emerald-700 hover:underline">
                  View all services
                </Link>
              </div>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {home.featuredServicesResolved.slice(0, 4).map((service) => (
                  <article
                    key={service.id}
                    className="group overflow-hidden rounded-2xl bg-white shadow-[0_12px_36px_rgba(15,23,42,0.08)] ring-1 ring-black/5 transition-all hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(15,23,42,0.14)]"
                  >
                    {service.featuredImage?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={service.featuredImage.url}
                        alt={service.featuredImage.altText || service.title}
                        className="h-52 w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-52 w-full bg-gradient-to-br from-[#0a6d49] via-[#0f7a54] to-[#46a56c]" />
                    )}
                    <div className="space-y-3 p-5">
                      <p className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#075f3f]">
                        {getServiceGroupLabel(service.serviceGroup || "engineering")}
                      </p>
                      <h3 className="text-lg font-semibold text-foreground">{service.title}</h3>
                      <p className="line-clamp-3 text-sm text-muted-foreground">
                        {service.excerpt || "Explore this service by UESPAK."}
                      </p>
                      <Link
                        href={`/services/${service.slug}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-[#075f3f] transition-colors group-hover:text-[#03452e]"
                      >
                        Learn More
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {home.servicesOverview.isActive ? (
            <section className="rounded-3xl bg-[linear-gradient(140deg,#f4faf6,#eef7f1)] p-6 md:p-8 shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-4">
                {home.servicesOverview.eyebrow ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#075f3f]">
                    {home.servicesOverview.eyebrow}
                  </p>
                ) : null}
                  <h2 className="text-3xl font-bold text-foreground">
                  {home.servicesOverview.title || "What We Offer"}
                </h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                  {home.servicesOverview.description}
                </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
                      <h3 className="text-sm font-semibold text-foreground">Engineering Services</h3>
                      <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <li>HVAC-R and environmental systems</li>
                        <li>Facility and technical project delivery</li>
                        <li>Mechanical and electrical execution</li>
                      </ul>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
                      <h3 className="text-sm font-semibold text-foreground">Agriculture Services</h3>
                      <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <li>Training and implementation support</li>
                        <li>Regenerative and practical models</li>
                        <li>Agriculture engineering integration</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-1">
                    <Link href="/services/group/engineering" className="inline-flex rounded-lg border border-[#b4d8c5] bg-white px-4 py-2 text-sm font-semibold text-[#075f3f] hover:border-[#7eb79a]">
                    Engineering Services
                  </Link>
                    <Link href="/services/group/agriculture" className="inline-flex rounded-lg border border-[#b4d8c5] bg-white px-4 py-2 text-sm font-semibold text-[#075f3f] hover:border-[#7eb79a]">
                    Agriculture Services
                  </Link>
                  </div>
                </div>
                <div>
                  {home.servicesOverview.image?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={home.servicesOverview.image.url}
                      alt={home.servicesOverview.image.altText || "Services Overview"}
                      className="h-full min-h-72 w-full rounded-2xl object-cover shadow-md"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full min-h-72 rounded-2xl bg-gradient-to-br from-[#0f7a54] to-[#1f8f62]" />
                  )}
                </div>
              </div>
              <div className="mt-7">
                <Link href="/services" className="inline-flex items-center gap-1 text-sm font-semibold text-[#075f3f] hover:underline">
                  View All Services
                  <ArrowRight className="h-4 w-4" />
                </Link>
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
            <section className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">
                {home.visionMission.title || "Vision, Mission & Values"}
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-white p-5 shadow-[0_8px_22px_rgba(15,23,42,0.08)] ring-1 ring-black/5">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#075f3f]">Vision</span>
                  <h3 className="font-semibold text-foreground">
                    {home.visionMission.visionTitle || "Vision"}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {home.visionMission.visionDescription}
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-5 shadow-[0_8px_22px_rgba(15,23,42,0.08)] ring-1 ring-black/5">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#075f3f]">Mission</span>
                  <h3 className="font-semibold text-foreground">
                    {home.visionMission.missionTitle || "Mission"}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {home.visionMission.missionDescription}
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-5 shadow-[0_8px_22px_rgba(15,23,42,0.08)] ring-1 ring-black/5">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#075f3f]">Values</span>
                  <h3 className="font-semibold text-foreground">
                    {home.visionMission.valuesTitle || "Values"}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {home.visionMission.valuesDescription}
                  </p>
                </div>
              </div>
            </section>
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

          {home.featuredProjects.isActive && home.featuredProjectsResolved.length ? (
            <section className="space-y-7">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#075f3f]">
                    Project Showcase
                  </p>
                  <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
                  {home.featuredProjects.title || "Featured Projects"}
                </h2>
                </div>
                <Link href="/projects" className="text-sm font-semibold text-emerald-700 hover:underline">
                  View all projects
                </Link>
              </div>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {home.featuredProjectsResolved.slice(0, 3).map((project) => (
                  <article
                    key={project.id}
                    className="group overflow-hidden rounded-2xl bg-white shadow-[0_14px_32px_rgba(15,23,42,0.1)] ring-1 ring-black/5 transition-all hover:-translate-y-1 hover:shadow-[0_22px_46px_rgba(15,23,42,0.15)]"
                  >
                    {project.featuredImage?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={project.featuredImage.url}
                        alt={project.featuredImage.altText || project.title}
                        className="h-56 w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-56 w-full bg-gradient-to-br from-[#0f7a54] to-[#3b9f68]" />
                    )}
                    <div className="space-y-3 p-5">
                      <p className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#075f3f]">
                        {getProjectGroupLabel(project.projectGroup || "engineering")}
                      </p>
                      <h3 className="text-lg font-semibold text-foreground">{project.title}</h3>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {project.excerpt || "Explore this project by UESPAK."}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {[project.client, project.location, project.discipline]
                          .filter(Boolean)
                          .join(" • ") || "Engineering and technical execution details available."}
                      </p>
                      <Link
                        href={`/projects/${project.slug}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-[#075f3f] transition-colors group-hover:text-[#03452e]"
                      >
                        View Details
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
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
