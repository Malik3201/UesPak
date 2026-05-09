import type { Metadata } from "next";
import Link from "next/link";
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
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 text-white">
        {home.hero.backgroundImage?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={home.hero.backgroundImage.url}
            alt={home.hero.backgroundImage.altText || "Hero background"}
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />
        ) : null}
        <Container className="relative section-py grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="space-y-5">
            {home.hero.eyebrow ? (
              <p className="inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                {home.hero.eyebrow}
              </p>
            ) : null}
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              {home.hero.title}
            </h1>
            {home.hero.subtitle ? (
              <p className="text-lg font-medium text-emerald-100">{home.hero.subtitle}</p>
            ) : null}
            {home.hero.description ? (
              <p className="max-w-2xl text-sm text-emerald-50 md:text-base">
                {home.hero.description}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-3">
              {home.hero.primaryButtonText && home.hero.primaryButtonUrl ? (
                <Link href={home.hero.primaryButtonUrl} className="inline-flex h-11 items-center rounded-md bg-white px-6 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 transition-colors">
                  {home.hero.primaryButtonText}
                </Link>
              ) : null}
              {home.hero.secondaryButtonText && home.hero.secondaryButtonUrl ? (
                <Link href={home.hero.secondaryButtonUrl} className="inline-flex h-11 items-center rounded-md border border-white/40 px-6 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
                  {home.hero.secondaryButtonText}
                </Link>
              ) : null}
            </div>
            {home.hero.badges?.length ? (
              <div className="flex flex-wrap gap-2 pt-2">
                {home.hero.badges.map((badge, idx) => (
                  <span key={`badge-${idx}`} className="rounded-full bg-white/10 px-3 py-1 text-xs text-emerald-50">
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
                className="mx-auto w-full max-w-xl rounded-2xl border border-white/20 object-cover shadow-2xl"
              />
            ) : (
              <div className="mx-auto flex h-72 w-full max-w-xl items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-sm text-emerald-100">
                UESPAK Engineering Excellence
              </div>
            )}
          </div>
        </Container>
      </section>

      <section className="section-py bg-white">
        <Container className="space-y-10">
          {home.featuredServices.isActive && home.featuredServicesResolved.length ? (
            <section className="space-y-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-3xl font-bold text-foreground">
                    {home.featuredServices.title || "Featured Services"}
                  </h2>
                  {home.featuredServices.description ? (
                    <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                      {home.featuredServices.description}
                    </p>
                  ) : null}
                </div>
                <Link href="/services" className="text-sm font-semibold text-emerald-700 hover:underline">
                  View all services
                </Link>
              </div>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {home.featuredServicesResolved.slice(0, 6).map((service) => (
                  <article key={service.id} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    {service.featuredImage?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={service.featuredImage.url} alt={service.featuredImage.altText || service.title} className="h-44 w-full object-cover" />
                    ) : (
                      <div className="h-44 w-full bg-muted/30" />
                    )}
                    <div className="space-y-2 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                        {getServiceGroupLabel(service.serviceGroup || "engineering")}
                      </p>
                      <h3 className="text-lg font-semibold text-foreground">{service.title}</h3>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {service.excerpt || "Explore this service by UESPAK."}
                      </p>
                      <Link href={`/services/${service.slug}`} className="inline-flex text-sm font-semibold text-emerald-700 hover:underline">
                        Learn More
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {home.servicesOverview.isActive ? (
            <section className="grid gap-6 rounded-2xl border border-border bg-muted/20 p-6 md:grid-cols-2">
              <div className="space-y-3">
                {home.servicesOverview.eyebrow ? (
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    {home.servicesOverview.eyebrow}
                  </p>
                ) : null}
                <h2 className="text-2xl font-bold text-foreground">
                  {home.servicesOverview.title || "What We Offer"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {home.servicesOverview.description}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Link href="/services/group/engineering" className="rounded-lg border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground hover:border-emerald-300">
                    Engineering Services
                  </Link>
                  <Link href="/services/group/agriculture" className="rounded-lg border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground hover:border-emerald-300">
                    Agriculture Services
                  </Link>
                </div>
                <Link href="/services" className="inline-flex text-sm font-semibold text-emerald-700 hover:underline">
                  View All Services
                </Link>
              </div>
              <div>
                {home.servicesOverview.image?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={home.servicesOverview.image.url} alt={home.servicesOverview.image.altText || "Services Overview"} className="h-full w-full rounded-xl object-cover" />
                ) : (
                  <div className="h-full min-h-56 rounded-xl bg-white" />
                )}
              </div>
            </section>
          ) : null}

          {home.whyChooseUs.isActive && home.whyChooseUs.items.length ? (
            <section className="space-y-4">
              <h2 className="text-3xl font-bold text-foreground">
                {home.whyChooseUs.title || "Why Choose UESPAK"}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[...home.whyChooseUs.items]
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .map((item, idx) => (
                    <article key={`why-item-${idx}`} className="rounded-xl border border-border bg-card p-5">
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      {item.description ? (
                        <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                      ) : null}
                    </article>
                  ))}
              </div>
            </section>
          ) : null}

          {home.aboutPreview.isActive ? (
            <section className="grid gap-6 rounded-2xl border border-border bg-white p-6 md:grid-cols-2">
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-foreground">
                  {home.aboutPreview.title || "About UESPAK"}
                </h2>
                <p className="text-sm text-muted-foreground">{home.aboutPreview.description}</p>
                {home.aboutPreview.buttonText && home.aboutPreview.buttonUrl ? (
                  <Link href={home.aboutPreview.buttonUrl} className="inline-flex rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 transition-colors">
                    {home.aboutPreview.buttonText}
                  </Link>
                ) : null}
              </div>
              <div>
                {home.aboutPreview.image?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={home.aboutPreview.image.url} alt={home.aboutPreview.image.altText || "About UESPAK"} className="h-full w-full rounded-xl object-cover" />
                ) : (
                  <div className="h-full min-h-56 rounded-xl bg-muted/30" />
                )}
              </div>
            </section>
          ) : null}

          {home.visionMission.isActive ? (
            <section className="space-y-4">
              <h2 className="text-3xl font-bold text-foreground">
                {home.visionMission.title || "Vision, Mission & Values"}
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-semibold text-foreground">
                    {home.visionMission.visionTitle || "Vision"}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {home.visionMission.visionDescription}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-semibold text-foreground">
                    {home.visionMission.missionTitle || "Mission"}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {home.visionMission.missionDescription}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
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

          {home.stats.isActive && home.stats.items.length ? (
            <section className="space-y-4">
              <h2 className="text-3xl font-bold text-foreground">{home.stats.title || "Stats"}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...home.stats.items]
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .map((item, idx) => (
                    <article key={`stat-${idx}`} className="rounded-xl border border-border bg-card p-5 text-center">
                      <p className="text-2xl font-bold text-emerald-700">
                        {item.value}
                        {item.suffix || ""}
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">{item.label}</p>
                      {item.description ? (
                        <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                      ) : null}
                    </article>
                  ))}
              </div>
            </section>
          ) : null}

          {home.featuredProjects.isActive && home.featuredProjectsResolved.length ? (
            <section className="space-y-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h2 className="text-3xl font-bold text-foreground">
                  {home.featuredProjects.title || "Featured Projects"}
                </h2>
                <Link href="/projects" className="text-sm font-semibold text-emerald-700 hover:underline">
                  View all projects
                </Link>
              </div>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {home.featuredProjectsResolved.slice(0, 6).map((project) => (
                  <article key={project.id} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    {project.featuredImage?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={project.featuredImage.url} alt={project.featuredImage.altText || project.title} className="h-44 w-full object-cover" />
                    ) : (
                      <div className="h-44 w-full bg-muted/30" />
                    )}
                    <div className="space-y-2 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                        {getProjectGroupLabel(project.projectGroup || "engineering")}
                      </p>
                      <h3 className="text-lg font-semibold text-foreground">{project.title}</h3>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {project.excerpt || "Explore this project by UESPAK."}
                      </p>
                      <Link href={`/projects/${project.slug}`} className="inline-flex text-sm font-semibold text-emerald-700 hover:underline">
                        View Details
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {home.industries.isActive && home.industries.items.length ? (
            <section className="space-y-4">
              <h2 className="text-3xl font-bold text-foreground">
                {home.industries.title || "Industries We Serve"}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {[...home.industries.items]
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .map((item, idx) => (
                    <article key={`industry-${idx}`} className="rounded-xl border border-border bg-card p-4">
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
            <section className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
              <h2 className="text-xl font-semibold text-foreground">
                {home.teamPreview.title || "Our Experts"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {home.teamPreview.description ||
                  "Team showcase module can be expanded as Team CMS evolves."}
              </p>
            </section>
          ) : null}

          {home.clients.isActive && home.clients.logos.length ? (
            <section className="space-y-4">
              <h2 className="text-3xl font-bold text-foreground">
                {home.clients.title || "Trusted By"}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {[...home.clients.logos]
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .map((client, idx) => (
                    <article key={`client-${idx}`} className="rounded-xl border border-border bg-card p-4">
                      {client.logo?.url ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={client.logo.url} alt={client.logo.altText || client.name} className="mx-auto h-14 w-auto object-contain" />
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
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="text-xl font-semibold text-foreground">{home.profileCTA.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{home.profileCTA.description}</p>
                  {settings.profilePdfUrl ? (
                    <a href={settings.profilePdfUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 transition-colors">
                      {home.profileCTA.buttonText || settings.profileButtonText || "Download Profile"}
                    </a>
                  ) : null}
                </div>
              ) : null}
              {home.contactCTA.isActive ? (
                <div className="rounded-2xl border border-border bg-emerald-800 p-6 text-white">
                  <h3 className="text-xl font-semibold">{home.contactCTA.title}</h3>
                  <p className="mt-2 text-sm text-emerald-50">{home.contactCTA.description}</p>
                  <Link href={home.contactCTA.buttonUrl || "/contact-us"} className="mt-4 inline-flex rounded-md bg-white px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 transition-colors">
                    {home.contactCTA.buttonText || "Contact Us"}
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
