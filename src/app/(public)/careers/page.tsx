import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Container from "@/components/shared/Container";
import CareersTeamSection from "@/components/public/careers/CareersTeamSection";
import { getPublishedTeamMembers } from "@/lib/team";

export const metadata: Metadata = buildMetadata({
  title: "Careers",
  description:
    "Join the UESPAK team. Explore current job openings and meet the engineers and specialists behind reliable project delivery.",
  canonicalPath: "/careers",
});

export default async function CareersPage() {
  const members = await getPublishedTeamMembers();

  return (
    <>
      <section className="section-py">
        <Container>
          <h1 className="text-4xl font-bold text-primary mb-4">
            Careers at UESPAK
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            We are building a multidisciplinary team across engineering,
            facility systems, industrial automation and agriculture. Open
            positions will be listed here as they become available.
          </p>
        </Container>
      </section>

      <CareersTeamSection members={members} />
    </>
  );
}
