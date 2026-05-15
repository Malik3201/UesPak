import type { Metadata } from "next";
import CatalogHero from "@/components/public/catalog/CatalogHero";
import CatalogBottomCta from "@/components/public/catalog/CatalogBottomCta";
import ServicesCatalog from "@/components/public/services/ServicesCatalog";
import { getPublishedServices } from "@/lib/services";
import { toServiceCardData } from "@/lib/catalog-public";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Engineering & Agriculture Services",
  description:
    "Explore UESPAK engineering services (HVAC-R, facility management, industrial automation) and agriculture services (regenerative farming, agricultural engineering, training) across Pakistan.",
  keywords: [
    "engineering services Pakistan",
    "HVAC-R",
    "industrial automation",
    "facility management",
    "agriculture services Pakistan",
    "regenerative farming",
    "agricultural engineering",
  ],
  canonicalPath: "/services",
});

export default async function ServicesPage() {
  const services = await getPublishedServices();
  const cards = services.map(toServiceCardData);

  return (
    <>
      <CatalogHero
        eyebrow="UESPAK Services"
        title="Engineering & Agriculture Services"
        description="Integrated engineering and agriculture solutions—built for performance, reliability, and long-term impact across industrial and agricultural environments."
        primaryCta={{ label: "Discuss Your Requirements", href: "/contact-us" }}
      />
      {cards.length === 0 ? (
        <section className="w-full bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 text-center text-slate-600 sm:px-6 lg:px-8">
            No published services available yet.
          </div>
        </section>
      ) : (
        <ServicesCatalog services={cards} />
      )}
      <CatalogBottomCta />
    </>
  );
}
