import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Container from "@/components/shared/Container";

export const metadata: Metadata = buildMetadata({
  title: "About Us",
  description:
    "Learn about UESPAK – our history, mission, values, and the team behind our engineering excellence.",
  canonicalPath: "/about-us",
});

export default function AboutUsPage() {
  return (
    <section className="section-py">
      <Container>
        <h1 className="text-4xl font-bold text-primary mb-4">About UESPAK</h1>
        <p className="text-muted-foreground max-w-2xl">
          Content coming soon. This page will showcase our company history,
          mission, values, leadership team, and certifications.
        </p>
      </Container>
    </section>
  );
}
