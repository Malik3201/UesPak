import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Container from "@/components/shared/Container";

export const metadata: Metadata = buildMetadata({
  title: "Our Projects",
  description:
    "Browse UESPAK's completed and ongoing engineering projects across Pakistan and the region.",
  canonicalPath: "/projects",
});

export default function ProjectsPage() {
  return (
    <section className="section-py">
      <Container>
        <h1 className="text-4xl font-bold text-primary mb-4">Our Projects</h1>
        <p className="text-muted-foreground max-w-2xl">
          Content coming soon. Projects will be dynamically loaded from the
          admin CMS with category filters.
        </p>
      </Container>
    </section>
  );
}
