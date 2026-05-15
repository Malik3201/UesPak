import type { Metadata } from "next";
import CatalogHero from "@/components/public/catalog/CatalogHero";
import CatalogBottomCta from "@/components/public/catalog/CatalogBottomCta";
import ProjectsCatalog from "@/components/public/projects/ProjectsCatalog";
import { getPublishedProjects } from "@/lib/projects";
import { toProjectCardData } from "@/lib/catalog-public";
import { getProjectsPageContent, getPageSeoMetadata } from "@/lib/page-content";
import { getDefaultPageContent } from "@/constants/page-content";

export async function generateMetadata(): Promise<Metadata> {
  const { pageContent } = await getProjectsPageContent();
  return getPageSeoMetadata(pageContent, {
    fallbackImage: pageContent.hero.backgroundImage?.url,
  });
}

export default async function ProjectsPage() {
  const [{ pageContent }, projects] = await Promise.all([
    getProjectsPageContent(),
    getPublishedProjects(),
  ]);
  const defaults = getDefaultPageContent("projects");
  const hero = pageContent.hero;
  const intro = pageContent.sections.intro;
  const cta = pageContent.sections.cta;
  const cards = projects.map(toProjectCardData);

  return (
    <>
      <CatalogHero
        eyebrow={hero.eyebrow || defaults.hero.eyebrow}
        title={hero.title || defaults.hero.title || "Engineering, Agriculture & Automation Projects"}
        description={
          hero.description ||
          defaults.hero.description ||
          "Browse UESPAK work across engineering, agriculture, and industrial automation."
        }
        backgroundImageUrl={hero.backgroundImage?.url}
        overlayOpacity={hero.overlayOpacity ?? defaults.hero.overlayOpacity}
        primaryCta={
          hero.primaryButtonText && hero.primaryButtonUrl
            ? { label: hero.primaryButtonText, href: hero.primaryButtonUrl }
            : undefined
        }
      />
      {cards.length === 0 ? (
        <section className="w-full bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 text-center text-slate-600 sm:px-6 lg:px-8">
            No published projects available yet.
          </div>
        </section>
      ) : (
        <ProjectsCatalog
          projects={cards}
          introTitle={intro.title || defaults.sections.intro.title}
          introDescription={intro.description || defaults.sections.intro.description}
          showGroupTabs={intro.showGroupTabs ?? defaults.sections.intro.showGroupTabs}
        />
      )}
      {cta.isActive !== false ? (
        <CatalogBottomCta
          title={cta.title || defaults.sections.cta.title}
          description={cta.description || defaults.sections.cta.description}
          buttonText={cta.buttonText || defaults.sections.cta.buttonText}
          buttonHref={cta.buttonUrl || defaults.sections.cta.buttonUrl}
          backgroundImageUrl={cta.backgroundImage?.url}
        />
      ) : null}
    </>
  );
}
