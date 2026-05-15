import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CatalogHero from "@/components/public/catalog/CatalogHero";
import CatalogBottomCta from "@/components/public/catalog/CatalogBottomCta";
import JsonLdScripts from "@/components/public/catalog/JsonLdScripts";
import ServiceCard from "@/components/public/services/ServiceCard";
import Container from "@/components/shared/Container";
import { getPublishedServicesByGroup } from "@/lib/services";
import { toServiceCardData } from "@/lib/catalog-public";
import { getServicesPageContent } from "@/lib/page-content";
import { getDefaultPageContent } from "@/constants/page-content";
import {
  resolveGroupHeroBackgroundUrl,
  resolveGroupHeroDescription,
  resolveGroupHeroTitle,
  resolveGroupOverlayOpacity,
} from "@/lib/catalog-group-page";
import { buildMetadata, SITE_URL } from "@/lib/seo";
import type { ServiceGroup } from "@/types/service";
import { getServiceGroupLabel } from "@/types/service";

interface Props {
  params: Promise<{ group: string }>;
}

function isServiceGroup(group: string): group is ServiceGroup {
  return group === "engineering" || group === "agriculture";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { group } = await params;
  if (!isServiceGroup(group)) return buildMetadata({ title: "Services", noIndex: true });

  const { pageContent } = await getServicesPageContent();
  const defaults = getDefaultPageContent("services");
  const groupSettings = pageContent.sections.serviceGroups?.[group];
  const defaultGroup = defaults.sections.serviceGroups[group];
  const label = getServiceGroupLabel(group);

  const title =
    groupSettings?.metaTitle?.trim() ||
    resolveGroupHeroTitle(groupSettings, defaultGroup.title || label);
  const description =
    groupSettings?.metaDescription?.trim() ||
    resolveGroupHeroDescription(groupSettings, defaultGroup.description || "");

  return buildMetadata({
    title: title.includes("UESPAK") ? title : `${title} | UESPAK`,
    description,
    canonicalPath: `/services/group/${group}`,
  });
}

export default async function ServiceGroupPage({ params }: Props) {
  const { group } = await params;
  if (!isServiceGroup(group)) notFound();

  const label = getServiceGroupLabel(group);
  const [{ pageContent }, services] = await Promise.all([
    getServicesPageContent(),
    getPublishedServicesByGroup(group),
  ]);
  const defaults = getDefaultPageContent("services");
  const hero = pageContent.hero;
  const cta = pageContent.sections.cta;
  const groupSettings = pageContent.sections.serviceGroups?.[group];
  const defaultGroup = defaults.sections.serviceGroups[group];
  const cards = services.map(toServiceCardData);

  const heroTitle = resolveGroupHeroTitle(groupSettings, defaultGroup.title || label);
  const heroDescription = resolveGroupHeroDescription(
    groupSettings,
    defaultGroup.description || ""
  );
  const backgroundImageUrl = resolveGroupHeroBackgroundUrl(groupSettings, hero);
  const overlayOpacity = resolveGroupOverlayOpacity(
    groupSettings,
    hero,
    defaults.hero.overlayOpacity ?? 0.88
  );

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Services", item: `${SITE_URL}/services` },
      {
        "@type": "ListItem",
        position: 3,
        name: heroTitle,
        item: `${SITE_URL}/services/group/${group}`,
      },
    ],
  };

  return (
    <>
      <CatalogHero
        eyebrow={hero.eyebrow || defaults.hero.eyebrow || "Service Group"}
        title={heroTitle}
        description={heroDescription}
        backgroundImageUrl={backgroundImageUrl}
        overlayOpacity={overlayOpacity}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: heroTitle },
        ]}
      />
      <section className="homepage-section-reveal w-full bg-[linear-gradient(180deg,#f7fbf8_0%,#eef8f2_100%)] py-14 md:py-20 lg:py-24">
        <Container>
          {cards.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-emerald-900/15 bg-[#f7fbf8] p-10 text-center text-slate-600">
              No published services available in this group yet.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </Container>
      </section>
      {cta.isActive !== false ? (
        <CatalogBottomCta
          title={cta.title || defaults.sections.cta.title}
          description={cta.description || defaults.sections.cta.description}
          buttonText={cta.buttonText || defaults.sections.cta.buttonText}
          buttonHref={cta.buttonUrl || defaults.sections.cta.buttonUrl}
          backgroundImageUrl={cta.backgroundImage?.url}
        />
      ) : null}
      <JsonLdScripts data={breadcrumbJsonLd} />
    </>
  );
}
