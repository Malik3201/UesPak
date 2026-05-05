import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/shared/Container";
import { getPublishedServices } from "@/lib/services";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Services",
  description: "Explore UESPAK service capabilities across engineering disciplines.",
  canonicalPath: "/services",
});

export default async function ServicesPage() {
  const services = await getPublishedServices();

  return (
    <section className="section-py">
      <Container>
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-primary mb-4">Our Services</h1>
          <p className="text-muted-foreground max-w-2xl">
            Explore our core engineering and project delivery services tailored for
            industrial and commercial environments.
          </p>
        </div>
        {services.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            No published services available yet.
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
    </section>
  );
}
