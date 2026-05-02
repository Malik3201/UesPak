import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import Container from "@/components/shared/Container";

export const metadata: Metadata = buildMetadata({
  title: "UESPAK – Engineering Excellence",
  description:
    "UESPAK delivers world-class engineering, procurement, and construction services across Pakistan. Explore our services and projects.",
  canonicalPath: "/",
});

export default function HomePage() {
  return (
    <section className="section-py">
      <Container className="flex flex-col items-center text-center gap-6">
        <h1 className="text-4xl md:text-5xl font-bold text-primary text-balance">
          Engineering Excellence
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground text-balance">
          UESPAK provides world-class engineering, procurement, and construction
          solutions across Pakistan and the broader region. Trusted by leading
          clients for quality, safety, and performance.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-2">
          <Link
            href="/services"
            className="inline-flex h-11 items-center rounded-md bg-primary px-7 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Our Services
          </Link>
          <Link
            href="/contact-us"
            className="inline-flex h-11 items-center rounded-md border border-border px-7 text-sm font-semibold text-foreground hover:bg-accent transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </Container>
    </section>
  );
}
