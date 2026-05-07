import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/shared/Container";
import { getGroupedPublishedServices } from "@/lib/services";
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
  const grouped = await getGroupedPublishedServices();
  const engineering = grouped.engineering;
  const agriculture = grouped.agriculture;

  return (
    <section className="section-py">
      <Container>
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-primary mb-4">Our Services</h1>
          <p className="text-muted-foreground max-w-2xl">
            UESPAK delivers integrated engineering and agriculture solutions—built for
            performance, reliability, and long-term impact.
          </p>
        </div>

        {engineering.length === 0 && agriculture.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            No published services available yet.
          </div>
        ) : (
          <div className="space-y-14">
            {engineering.length ? (
              <section>
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Engineering Services</h2>
                    <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                      Engineering, compliance, optimization, and delivery—across industrial and
                      commercial environments.
                    </p>
                  </div>
                  <Link
                    href="/services/group/engineering"
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    View engineering services
                  </Link>
                </div>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {engineering.map((service) => (
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
                        <h3 className="text-lg font-semibold text-foreground">{service.title}</h3>
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
              </section>
            ) : null}

            {agriculture.length ? (
              <section>
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Agriculture Services</h2>
                    <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                      Training, regenerative practices, and practical implementation—designed for
                      resilient production and sustainable outcomes.
                    </p>
                  </div>
                  <Link
                    href="/services/group/agriculture"
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    View agriculture services
                  </Link>
                </div>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {agriculture.map((service) => (
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
                        <h3 className="text-lg font-semibold text-foreground">{service.title}</h3>
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
              </section>
            ) : null}

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-xl font-semibold text-foreground">
                Need a tailored solution?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Tell us about your requirements—our team will recommend the right service mix and
                next steps.
              </p>
              <Link
                href="/contact-us"
                className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Contact UESPAK
              </Link>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
