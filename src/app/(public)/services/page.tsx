import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Container from "@/components/shared/Container";

export const metadata: Metadata = buildMetadata({
  title: "Our Services",
  description:
    "Explore UESPAK's full range of engineering services including EPC, project management, and technical consulting.",
  canonicalPath: "/services",
});

export default function ServicesPage() {
  return (
    <section className="section-py">
      <Container>
        <h1 className="text-4xl font-bold text-primary mb-4">Our Services</h1>
        <p className="text-muted-foreground max-w-2xl">
          Content coming soon. Services will be dynamically loaded from the
          admin CMS.
        </p>
      </Container>
    </section>
  );
}
