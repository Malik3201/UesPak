import type { Metadata } from "next";
import CatalogHero from "@/components/public/catalog/CatalogHero";
import CatalogBottomCta from "@/components/public/catalog/CatalogBottomCta";
import ServicesCatalog from "@/components/public/services/ServicesCatalog";
import { getPublishedServices } from "@/lib/services";
import { toServiceCardData } from "@/lib/catalog-public";
import { getServicesPageContent, getPageSeoMetadata } from "@/lib/page-content";
import { getDefaultPageContent } from "@/constants/page-content";

export async function generateMetadata(): Promise<Metadata> {
  const { pageContent } = await getServicesPageContent();
  return getPageSeoMetadata(pageContent, {
    fallbackImage: pageContent.hero.backgroundImage?.url,
  });
}

export default async function ServicesPage() {
  const [{ pageContent }, services] = await Promise.all([
    getServicesPageContent(),
    getPublishedServices(),
  ]);
  const defaults = getDefaultPageContent("services");
  const hero = pageContent.hero;
  const intro = pageContent.sections.intro;
  const cta = pageContent.sections.cta;
  const cards = services.map(toServiceCardData);

  const heroTitle = hero.title || defaults.hero.title || "Engineering & Agriculture Services";
  const heroDescription =
    hero.description ||
    defaults.hero.description ||
    "Integrated engineering and agriculture solutions—built for performance, reliability, and long-term impact.";

  return (
    <>
      <CatalogHero
        eyebrow={hero.eyebrow || defaults.hero.eyebrow}
        title={heroTitle}
        description={heroDescription}
        backgroundImageUrl={hero.backgroundImage?.url}
        overlayOpacity={hero.overlayOpacity ?? defaults.hero.overlayOpacity}
        primaryCta={
          hero.primaryButtonText && hero.primaryButtonUrl
            ? { label: hero.primaryButtonText, href: hero.primaryButtonUrl }
            : undefined
        }
      />
      {cards.length === 0 ? (
        <section className="w-full bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 text-center text-slate-600 sm:px-6 lg:px-8">
            No published services available yet.
          </div>
        </section>
      ) : (
        <ServicesCatalog
          services={cards}
          introTitle={intro.title || defaults.sections.intro.title}
          introDescription={intro.description || defaults.sections.intro.description}
          showGroupTabs={intro.showGroupTabs ?? defaults.sections.intro.showGroupTabs}
        />
      )}
      {cta.isActive !== false ? (
        <CatalogBottomCta
          title={cta.title || defaults.sections.cta.title}
          description={cta.description || defaults.sections.cta.description}
          buttonText={cta.buttonText || defaults.sections.cta.buttonText}
          buttonHref={cta.buttonUrl || defaults.sections.cta.buttonUrl}
          backgroundImageUrl={cta.backgroundImage?.url}
        />
      ) : null}
    </>
  );
}
