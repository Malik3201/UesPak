import { buildMetadata } from "@/lib/seo";
import Container from "@/components/shared/Container";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "Service Details",
  description: "Detailed information about this UESPAK service.",
});

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  return (
    <section className="section-py">
      <Container>
        <h1 className="text-3xl font-bold text-primary mb-4">
          Service: {slug}
        </h1>
        <p className="text-muted-foreground">
          Service detail content will be loaded from MongoDB.
        </p>
      </Container>
    </section>
  );
}
