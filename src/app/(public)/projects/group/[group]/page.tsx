import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/shared/Container";
import { buildMetadata, SITE_URL } from "@/lib/seo";
import { getPublishedProjectsByGroup } from "@/lib/projects";
import {
  getProjectGroupFromSlug,
  getProjectGroupLabel,
  type ProjectGroup,
} from "@/types/project";

interface Props {
  params: Promise<{ group: string }>;
}

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
    description:
      group === "agriculture"
        ? "Explore UESPAK agriculture projects including implementation, practical farm systems, and sustainable outcomes."
        : group === "industrialAutomation"
          ? "Explore UESPAK industrial automation projects including controls, instrumentation, and optimization delivery."
          : "Explore UESPAK engineering projects including HVAC-R, facility delivery, and technical execution.",
    canonicalPath: `/projects/group/${groupSlug}`,
  });
}

export default async function ProjectGroupPage({ params }: Props) {
  const { group: groupSlug } = await params;
  const group = getProjectGroupFromSlug(groupSlug);
  if (!group) notFound();

  const title = getProjectGroupLabel(group);
  const projects = await getPublishedProjectsByGroup(group);

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
    <section className="section-py">
      <Container>
        <nav className="mb-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:underline">Home</Link> /{" "}
          <Link href="/projects" className="hover:underline">Projects</Link> /{" "}
          <span className="text-foreground">{title}</span>
        </nav>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">{title}</h1>
        </div>
        {projects.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            No published projects in this group yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <article key={String(project._id)} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                {project.featuredImage?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={project.featuredImage.url} alt={project.featuredImage.altText || project.title} className="h-44 w-full object-cover" />
                ) : (
                  <div className="h-44 w-full bg-muted/40" />
                )}
                <div className="space-y-3 p-5">
                  <h2 className="text-lg font-semibold text-foreground">{project.title}</h2>
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {project.excerpt || "Explore this project by UESPAK."}
                  </p>
                  <Link href={`/projects/${project.slug}`} className="inline-flex text-sm font-semibold text-primary hover:underline">
                    View Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </Container>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    </section>
  );
}

