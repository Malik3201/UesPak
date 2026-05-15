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
import { buildMetadata, SITE_URL } from "@/lib/seo";
import type { ServiceGroup } from "@/types/service";
import { getServiceGroupLabel } from "@/types/service";

interface Props {
  params: Promise<{ group: string }>;
}

function isServiceGroup(group: string): group is ServiceGroup {
  return group === "engineering" || group === "agriculture";
}

const GROUP_INTRO: Record<ServiceGroup, string> = {
  engineering:
    "Engineering, compliance, optimization, and delivery—across industrial and commercial environments.",
  agriculture:
    "Training, regenerative practices, and practical implementation—designed for resilient production and sustainable outcomes.",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { group } = await params;
  if (!isServiceGroup(group)) return buildMetadata({ title: "Services", noIndex: true });

  const label = getServiceGroupLabel(group);
  const title = `${label} | UESPAK`;
  const description =
    group === "agriculture"
      ? "Explore UESPAK agriculture services including training, regenerative farming, agricultural engineering, and sustainable implementation across Pakistan."
      : "Explore UESPAK engineering services including HVAC-R, facility management, industrial automation, and project planning across Pakistan.";

  return buildMetadata({
    title,
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
  const cards = services.map(toServiceCardData);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Services", item: `${SITE_URL}/services` },
      {
        "@type": "ListItem",
        position: 3,
        name: label,
        item: `${SITE_URL}/services/group/${group}`,
      },
    ],
  };

  return (
    <>
      <CatalogHero
        eyebrow={hero.eyebrow || defaults.hero.eyebrow || "Service Group"}
        title={label}
        description={GROUP_INTRO[group]}
        backgroundImageUrl={hero.backgroundImage?.url}
        overlayOpacity={hero.overlayOpacity ?? defaults.hero.overlayOpacity}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label },
        ]}
      />
      <section className="homepage-section-reveal w-full bg-white py-14 md:py-20 lg:py-24">
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
