import type { Metadata } from "next";
import CatalogHero from "@/components/public/catalog/CatalogHero";
import CatalogBottomCta from "@/components/public/catalog/CatalogBottomCta";
import ProjectsCatalog from "@/components/public/projects/ProjectsCatalog";
import { getPublishedProjects } from "@/lib/projects";
import { toProjectCardData } from "@/lib/catalog-public";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Engineering, Agriculture & Automation Projects",
  description:
    "Explore UESPAK engineering projects, agriculture projects, and industrial automation execution including HVAC-R, facility management, mechanical/electrical systems, and technical delivery across Pakistan.",
  keywords: [
    "engineering projects Pakistan",
    "agriculture projects Pakistan",
    "industrial automation projects",
    "HVAC projects",
    "facility management projects",
    "mechanical engineering projects",
    "electrical engineering projects",
    "UESPAK projects",
  ],
  canonicalPath: "/projects",
});

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();
  const cards = projects.map(toProjectCardData);

  return (
    <>
      <CatalogHero
        eyebrow="UESPAK Portfolio"
        title="Engineering, Agriculture & Automation Projects"
        description="Browse UESPAK work across engineering, agriculture, and industrial automation—delivered with technical rigor and measurable outcomes."
        primaryCta={{ label: "Discuss Your Project", href: "/contact-us" }}
      />
      {cards.length === 0 ? (
        <section className="w-full bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 text-center text-slate-600 sm:px-6 lg:px-8">
            No published projects available yet.
          </div>
        </section>
      ) : (
        <ProjectsCatalog projects={cards} />
      )}
      <CatalogBottomCta
        title="Ready to deliver your next project?"
        description="Share your site context and objectives—our team will outline a practical execution path."
        buttonText="Contact UESPAK"
        buttonHref="/contact-us"
      />
    </>
  );
}
