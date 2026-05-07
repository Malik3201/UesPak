import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Container from "@/components/shared/Container";
import Link from "next/link";
import { getGroupedPublishedProjects } from "@/lib/projects";

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
  const grouped = await getGroupedPublishedProjects();
  const sections = [
    {
      key: "engineering",
      title: "Engineering Projects",
      href: "/projects/group/engineering",
      items: grouped.engineering,
    },
    {
      key: "agriculture",
      title: "Agriculture Projects",
      href: "/projects/group/agriculture",
      items: grouped.agriculture,
    },
    {
      key: "industrial",
      title: "Industrial Automation",
      href: "/projects/group/industrial-automation",
      items: grouped.industrialAutomation,
    },
  ] as const;

  const total =
    grouped.engineering.length +
    grouped.agriculture.length +
    grouped.industrialAutomation.length;

  return (
    <section className="section-py">
      <Container>
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-primary mb-4">Projects</h1>
          <p className="text-muted-foreground max-w-3xl">
            Browse UESPAK work across engineering, agriculture, and industrial
            automation implementations delivered for practical, measurable outcomes.
          </p>
        </div>
        {total === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            No published projects available yet.
          </div>
        ) : (
          <div className="space-y-14">
            {sections.map((section) =>
              section.items.length ? (
                <section key={section.key}>
                  <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                    <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
                    <Link href={section.href} className="text-sm font-semibold text-primary hover:underline">
                      View all
                    </Link>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {section.items.map((project) => (
                      <article key={String(project._id)} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                        {project.featuredImage?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={project.featuredImage.url}
                            alt={project.featuredImage.altText || project.title}
                            className="h-44 w-full object-cover"
                          />
                        ) : (
                          <div className="h-44 w-full bg-muted/40" />
                        )}
                        <div className="space-y-3 p-5">
                          <h3 className="text-lg font-semibold text-foreground">{project.title}</h3>
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {project.excerpt || "Explore this project by UESPAK."}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {[project.client, project.site, project.location]
                              .filter(Boolean)
                              .join(" • ") || "Project details available on profile."}
                          </p>
                          <Link href={`/projects/${project.slug}`} className="inline-flex text-sm font-semibold text-primary hover:underline">
                            View Details
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null
            )}
          </div>
        )}
      </Container>
    </section>
  );
}
