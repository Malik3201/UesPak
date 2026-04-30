import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Container from "@/components/shared/Container";

export const metadata: Metadata = buildMetadata({
  title: "Careers",
  description:
    "Join the UESPAK team. Explore current job openings and career opportunities in engineering and project management.",
  canonicalPath: "/careers",
});

export default function CareersPage() {
  return (
    <section className="section-py">
      <Container>
        <h1 className="text-4xl font-bold text-primary mb-4">
          Careers at UESPAK
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Content coming soon. Job openings and team profiles will be managed
          via the admin CMS.
        </p>
      </Container>
    </section>
  );
}
