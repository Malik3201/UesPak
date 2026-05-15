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
import {
  resolveGroupHeroBackgroundUrl,
  resolveGroupHeroDescription,
  resolveGroupHeroTitle,
  resolveGroupOverlayOpacity,
} from "@/lib/catalog-group-page";
import { buildMetadata, SITE_URL } from "@/lib/seo";
import { getProjectGroupFromSlug, getProjectGroupLabel } from "@/types/project";

interface Props {
  params: Promise<{ group: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { group: groupSlug } = await params;
  const group = getProjectGroupFromSlug(groupSlug);
  if (!group) return buildMetadata({ title: "Projects", noIndex: true });

  const { pageContent } = await getProjectsPageContent();
  const defaults = getDefaultPageContent("projects");
  const groupSettings = pageContent.sections.projectGroups?.[group];
  const defaultGroup = defaults.sections.projectGroups[group];
  const label = getProjectGroupLabel(group);

  const title =
    groupSettings?.metaTitle?.trim() ||
    resolveGroupHeroTitle(groupSettings, defaultGroup.title || label);
  const description =
    groupSettings?.metaDescription?.trim() ||
    resolveGroupHeroDescription(groupSettings, defaultGroup.description || "");

  return buildMetadata({
    title: title.includes("UESPAK") ? title : `${title} | UESPAK`,
    description,
    canonicalPath: `/projects/group/${groupSlug}`,
  });
}

export default async function ProjectGroupPage({ params }: Props) {
  const { group: groupSlug } = await params;
  const group = getProjectGroupFromSlug(groupSlug);
  if (!group) notFound();

  const label = getProjectGroupLabel(group);
  const [{ pageContent }, projects] = await Promise.all([
    getProjectsPageContent(),
    getPublishedProjectsByGroup(group),
  ]);
  const defaults = getDefaultPageContent("projects");
  const hero = pageContent.hero;
  const cta = pageContent.sections.cta;
  const groupSettings = pageContent.sections.projectGroups?.[group];
  const defaultGroup = defaults.sections.projectGroups[group];
  const cards = projects.map(toProjectCardData);

  const heroTitle = resolveGroupHeroTitle(groupSettings, defaultGroup.title || label);
  const heroDescription = resolveGroupHeroDescription(
    groupSettings,
    defaultGroup.description || ""
  );
  const backgroundImageUrl = resolveGroupHeroBackgroundUrl(groupSettings, hero);
  const overlayOpacity = resolveGroupOverlayOpacity(
    groupSettings,
    hero,
    defaults.hero.overlayOpacity ?? 0.88
  );

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Projects", item: `${SITE_URL}/projects` },
      {
        "@type": "ListItem",
        position: 3,
        name: heroTitle,
        item: `${SITE_URL}/projects/group/${groupSlug}`,
      },
    ],
  };

  return (
    <>
      <CatalogHero
        eyebrow={hero.eyebrow || defaults.hero.eyebrow || "Project Portfolio"}
        title={heroTitle}
        description={heroDescription}
        backgroundImageUrl={backgroundImageUrl}
        overlayOpacity={overlayOpacity}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Projects", href: "/projects" },
          { label: heroTitle },
        ]}
      />
      <section className="homepage-section-reveal w-full bg-[linear-gradient(180deg,#f7fbf8_0%,#eef8f2_100%)] py-14 md:py-20 lg:py-24">
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
