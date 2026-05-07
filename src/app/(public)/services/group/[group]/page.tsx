import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/shared/Container";
import { getPublishedServicesByGroup } from "@/lib/services";
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
  const services = await getPublishedServicesByGroup(group);

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
          / <span className="text-foreground">{label}</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">{label}</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            {group === "agriculture"
              ? "Training, regenerative practices, and practical implementation—designed for resilient production and sustainable outcomes."
              : "Engineering, compliance, optimization, and delivery—across industrial and commercial environments."}
          </p>
        </div>

        {services.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            No published services available in this group yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <article
                key={String(service._id)}
                className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
              >
                {service.featuredImage?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={service.featuredImage.url}
                    alt={service.featuredImage.altText || service.title}
                    className="h-44 w-full object-cover"
                  />
                ) : (
                  <div className="h-44 w-full bg-muted/40" />
                )}
                <div className="space-y-3 p-5">
                  <h2 className="text-lg font-semibold text-foreground">{service.title}</h2>
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {service.excerpt || "Learn more about this service offering."}
                  </p>
                  <Link
                    href={`/services/${service.slug}`}
                    className="inline-flex text-sm font-semibold text-primary hover:underline"
                  >
                    View Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </Container>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </section>
  );
}

