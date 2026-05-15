import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServiceDetailView from "@/components/public/services/ServiceDetailView";
import JsonLdScripts from "@/components/public/catalog/JsonLdScripts";
import {
  getAllServiceSlugs,
  getRelatedPublishedServices,
  getServiceBySlug,
  getServiceGroup,
  getServiceSeoMetadata,
} from "@/lib/services";
import { getProjectsLinkedToService } from "@/lib/projects";
import { getPublicSiteSettings } from "@/lib/site-settings";
import { SITE_URL } from "@/lib/seo";
import { getServiceGroupLabel } from "@/types/service";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllServiceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) {
    return {
      title: "Service Not Found | UESPAK",
      robots: { index: false, follow: false },
    };
  }
  return getServiceSeoMetadata(service);
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const serviceGroup = getServiceGroup(service);
  const groupLabel = getServiceGroupLabel(serviceGroup);
  const serviceId = String(service._id);

  const [relatedProjects, relatedServices, settings] = await Promise.all([
    getProjectsLinkedToService(serviceId),
    getRelatedPublishedServices(serviceGroup, service.slug),
    getPublicSiteSettings(),
  ]);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Services", item: `${SITE_URL}/services` },
      {
        "@type": "ListItem",
        position: 3,
        name: groupLabel,
        item: `${SITE_URL}/services/group/${serviceGroup}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: service.title,
        item: `${SITE_URL}/services/${service.slug}`,
      },
    ],
  };

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.excerpt || service.seo?.metaDescription || "",
    serviceType: service.category || service.title,
    provider: {
      "@type": "Organization",
      name: "UESPAK",
      url: SITE_URL,
    },
    areaServed: "Pakistan",
    url: `${SITE_URL}/services/${service.slug}`,
    image: service.featuredImage?.url || undefined,
  };

  return (
    <>
      <ServiceDetailView
        service={service}
        relatedProjects={relatedProjects}
        relatedServices={relatedServices}
        settings={settings}
      />
      <JsonLdScripts data={[breadcrumbJsonLd, serviceJsonLd]} />
    </>
  );
}
