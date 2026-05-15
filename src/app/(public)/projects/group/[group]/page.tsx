import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CatalogHero from "@/components/public/catalog/CatalogHero";
import CatalogBottomCta from "@/components/public/catalog/CatalogBottomCta";
import JsonLdScripts from "@/components/public/catalog/JsonLdScripts";
import ProjectCard from "@/components/public/projects/ProjectCard";
import Container from "@/components/shared/Container";
import { getPublishedProjectsByGroup } from "@/lib/projects";
import { toProjectCardData } from "@/lib/catalog-public";
import { getProjectsPageContent } from "@/lib/page-content";
import { getDefaultPageContent } from "@/constants/page-content";
import { buildMetadata, SITE_URL } from "@/lib/seo";
import {
  getProjectGroupFromSlug,
  getProjectGroupLabel,
  type ProjectGroup,
} from "@/types/project";

interface Props {
  params: Promise<{ group: string }>;
}

const GROUP_INTRO: Record<ProjectGroup, string> = {
  engineering:
    "Explore UESPAK engineering projects including HVAC-R, facility delivery, mechanical/electrical systems, and technical execution.",
  agriculture:
    "Explore UESPAK agriculture projects including implementation, practical farm systems, and sustainable outcomes.",
  industrialAutomation:
    "Explore UESPAK industrial automation projects including controls, instrumentation, and optimization delivery.",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { group: groupSlug } = await params;
  const group = getProjectGroupFromSlug(groupSlug);
  if (!group) return buildMetadata({ title: "Projects", noIndex: true });

  const titleMap: Record<ProjectGroup, string> = {
    engineering: "Engineering Projects | UESPAK",
    agriculture: "Agriculture Projects | UESPAK",
    industrialAutomation: "Industrial Automation Projects | UESPAK",
  };

  return buildMetadata({
    title: titleMap[group],
    description: GROUP_INTRO[group],
    canonicalPath: `/projects/group/${groupSlug}`,
  });
}

export default async function ProjectGroupPage({ params }: Props) {
  const { group: groupSlug } = await params;
  const group = getProjectGroupFromSlug(groupSlug);
  if (!group) notFound();

  const title = getProjectGroupLabel(group);
  const [{ pageContent }, projects] = await Promise.all([
    getProjectsPageContent(),
    getPublishedProjectsByGroup(group),
  ]);
  const defaults = getDefaultPageContent("projects");
  const hero = pageContent.hero;
  const cta = pageContent.sections.cta;
  const cards = projects.map(toProjectCardData);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Projects", item: `${SITE_URL}/projects` },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: `${SITE_URL}/projects/group/${groupSlug}`,
      },
    ],
  };

  return (
    <>
      <CatalogHero
        eyebrow={hero.eyebrow || defaults.hero.eyebrow || "Project Portfolio"}
        title={title}
        description={GROUP_INTRO[group]}
        backgroundImageUrl={hero.backgroundImage?.url}
        overlayOpacity={hero.overlayOpacity ?? defaults.hero.overlayOpacity}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Projects", href: "/projects" },
          { label: title },
        ]}
      />
      <section className="homepage-section-reveal w-full bg-white py-14 md:py-20 lg:py-24">
        <Container>
          {cards.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-emerald-900/15 bg-[#f7fbf8] p-10 text-center text-slate-600">
              No published projects in this group yet.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {cards.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </Container>
      </section>
      {cta.isActive !== false ? (
        <CatalogBottomCta
          title={cta.title || defaults.sections.cta.title}
          description={cta.description || defaults.sections.cta.description}
          buttonText={cta.buttonText || defaults.sections.cta.buttonText}
          buttonHref={cta.buttonUrl || defaults.sections.cta.buttonUrl}
          backgroundImageUrl={cta.backgroundImage?.url}
        />
      ) : null}
      <JsonLdScripts data={breadcrumbJsonLd} />
    </>
  );
}
