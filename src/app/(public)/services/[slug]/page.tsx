import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Container from "@/components/shared/Container";
import { getAllServiceSlugs, getServiceBySlug, getServiceSeoMetadata } from "@/lib/services";
import { SITE_URL } from "@/lib/seo";

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

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Services", item: `${SITE_URL}/services` },
      {
        "@type": "ListItem",
        position: 3,
        name: service.title,
        item: `${SITE_URL}/services/${service.slug}`,
      },
    ],
  };
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.excerpt || "",
    serviceType: service.category || service.title,
    provider: {
      "@type": "Organization",
      name: "UESPAK",
      url: SITE_URL,
    },
    areaServed: "Pakistan",
    url: `${SITE_URL}/services/${service.slug}`,
  };

  return (
    <section className="section-py">
      <Container>
        <nav className="mb-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:underline">
            Home
          </Link>{" "}
          /{" "}
          <Link href="/services" className="hover:underline">
            Services
          </Link>{" "}
          / <span className="text-foreground">{service.title}</span>
        </nav>
        <h1 className="text-3xl font-bold text-primary mb-3">{service.title}</h1>
        {service.excerpt ? (
          <p className="mb-6 max-w-3xl text-muted-foreground">{service.excerpt}</p>
        ) : null}

        {service.featuredImage?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={service.featuredImage.url}
            alt={service.featuredImage.altText || service.title}
            className="mb-8 h-auto w-full rounded-xl border border-border object-cover"
          />
        ) : null}

        {service.content ? (
          <article
            className="prose prose-neutral mb-8 max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: service.content }}
          />
        ) : null}

        {service.bulletPoints?.length ? (
          <div className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-foreground">Key Highlights</h2>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              {service.bulletPoints.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {service.gallery?.length ? (
          <div className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-foreground">Gallery</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {service.gallery.map((img, idx) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`${img.publicId}-${idx}`}
                  src={img.url}
                  alt={img.altText || `${service.title} image ${idx + 1}`}
                  className="h-52 w-full rounded-lg border border-border object-cover"
                />
              ))}
            </div>
          </div>
        ) : null}

        {service.faqs?.length ? (
          <div className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-foreground">FAQs</h2>
            <div className="space-y-3">
              {service.faqs.map((faq, idx) => (
                <details key={idx} className="rounded-md border border-border bg-card p-4">
                  <summary className="cursor-pointer font-medium text-foreground">
                    {faq.question}
                  </summary>
                  <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        ) : null}

        {service.cta?.isActive ? (
          <div className="rounded-xl border border-primary/30 bg-primary/10 p-6">
            {service.cta.title ? (
              <h2 className="text-xl font-semibold text-foreground">{service.cta.title}</h2>
            ) : null}
            {service.cta.description ? (
              <p className="mt-2 text-sm text-muted-foreground">{service.cta.description}</p>
            ) : null}
            {service.cta.buttonUrl && service.cta.buttonText ? (
              <Link
                href={service.cta.buttonUrl}
                className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                {service.cta.buttonText}
              </Link>
            ) : null}
          </div>
        ) : null}
      </Container>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </section>
  );
}
