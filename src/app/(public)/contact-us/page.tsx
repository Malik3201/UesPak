import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Container from "@/components/shared/Container";

export const metadata: Metadata = buildMetadata({
  title: "Contact Us",
  description:
    "Get in touch with UESPAK for project enquiries, service information, or general support.",
  canonicalPath: "/contact-us",
});

export default function ContactPage() {
  return (
    <section className="section-py">
      <Container size="md">
        <h1 className="text-4xl font-bold text-primary mb-4">Contact Us</h1>
        <p className="text-muted-foreground max-w-xl mb-8">
          Ready to discuss your project? Send us a message and our team will get
          back to you within 24 hours.
        </p>
        {/* Contact form will be implemented in Phase 2 */}
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          <p>Contact form coming soon.</p>
        </div>
      </Container>
    </section>
  );
}
