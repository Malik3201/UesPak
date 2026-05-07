import { SITE_URL } from "@/lib/seo";
import Container from "@/components/shared/Container";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllProjectSlugs, getProjectBySlug, getProjectSeoMetadata } from "@/lib/projects";
import { getProjectGroupLabel, getProjectGroupSlug } from "@/types/project";
import { connectDB } from "@/lib/db";
import { Service } from "@/models/Service";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) {
    return {
      title: "Project Not Found | UESPAK",
      robots: { index: false, follow: false },
    };
  }
  return getProjectSeoMetadata(project);
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  let linkedServices: Array<{ title: string; slug: string }> = [];
  if (project.linkedServices?.length) {
    try {
      await connectDB();
      const ids = project.linkedServices.map((idObj) => String(idObj));
      const docs = await Service.find({
        _id: { $in: ids },
        status: "published",
      })
        .select("title slug")
        .sort({ title: 1 })
        .lean();
      linkedServices = docs.map((d) => ({ title: d.title, slug: d.slug }));
    } catch {
      linkedServices = [];
    }
  }

  const group =
    project.projectGroup === "agriculture"
      ? "agriculture"
      : project.projectGroup === "industrialAutomation"
        ? "industrialAutomation"
        : "engineering";
  const groupLabel = getProjectGroupLabel(group);
  const groupSlug = getProjectGroupSlug(group);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Projects", item: `${SITE_URL}/projects` },
      {
        "@type": "ListItem",
        position: 3,
        name: groupLabel,
        item: `${SITE_URL}/projects/group/${groupSlug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: project.title,
        item: `${SITE_URL}/projects/${project.slug}`,
      },
    ],
  };
  const projectJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.excerpt || project.description || "",
    creator: { "@type": "Organization", name: "UESPAK", url: SITE_URL },
    url: `${SITE_URL}/projects/${project.slug}`,
  };

  return (
    <section className="section-py">
      <Container>
        <nav className="mb-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:underline">Home</Link> /{" "}
          <Link href="/projects" className="hover:underline">Projects</Link> /{" "}
          <Link href={`/projects/group/${groupSlug}`} className="hover:underline">{groupLabel}</Link> /{" "}
          <span className="text-foreground">{project.title}</span>
        </nav>
        <h1 className="text-3xl font-bold text-primary mb-3">{project.title}</h1>
        {project.excerpt ? <p className="mb-6 max-w-3xl text-muted-foreground">{project.excerpt}</p> : null}
        {project.featuredImage?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.featuredImage.url} alt={project.featuredImage.altText || project.title} className="mb-8 h-auto w-full rounded-xl border border-border object-cover" />
        ) : null}

        <div className="mb-8 grid gap-3 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground md:grid-cols-2">
          {project.client ? <p><span className="font-semibold text-foreground">Client:</span> {project.client}</p> : null}
          {project.site ? <p><span className="font-semibold text-foreground">Site:</span> {project.site}</p> : null}
          {project.location ? <p><span className="font-semibold text-foreground">Location:</span> {project.location}</p> : null}
          {project.discipline ? <p><span className="font-semibold text-foreground">Discipline:</span> {project.discipline}</p> : null}
          {project.commissioningDate ? <p><span className="font-semibold text-foreground">Commissioning Date:</span> {new Date(project.commissioningDate).toLocaleDateString()}</p> : null}
        </div>

        {project.content ? (
          <article className="prose prose-neutral mb-8 max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: project.content }} />
        ) : null}

        {project.scope ? (
          <div className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-foreground">Scope</h2>
            <p className="text-muted-foreground">{project.scope}</p>
          </div>
        ) : null}
        {project.scopeItems?.length ? (
          <div className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-foreground">Scope Items</h2>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">{project.scopeItems.map((item, idx) => <li key={idx}>{item}</li>)}</ul>
          </div>
        ) : null}
        {project.technologies?.length ? (
          <div className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-foreground">Technologies</h2>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">{project.technologies.map((item, idx) => <li key={idx}>{item}</li>)}</ul>
          </div>
        ) : null}
        {project.outcomes?.length ? (
          <div className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-foreground">Outcomes</h2>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">{project.outcomes.map((item, idx) => <li key={idx}>{item}</li>)}</ul>
          </div>
        ) : null}
        {project.gallery?.length ? (
          <div className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-foreground">Gallery</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {project.gallery.map((img, idx) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={`${img.publicId}-${idx}`} src={img.url} alt={img.altText || `${project.title} image ${idx + 1}`} className="h-52 w-full rounded-lg border border-border object-cover" />
              ))}
            </div>
          </div>
        ) : null}
        {linkedServices.length ? (
          <div className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-foreground">Linked Services</h2>
            <div className="flex flex-wrap gap-2">
              {linkedServices.map((service) => (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  {service.title}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
        {project.cta?.isActive ? (
          <div className="rounded-xl border border-primary/30 bg-primary/10 p-6">
            {project.cta.title ? <h2 className="text-xl font-semibold text-foreground">{project.cta.title}</h2> : null}
            {project.cta.description ? <p className="mt-2 text-sm text-muted-foreground">{project.cta.description}</p> : null}
            {project.cta.buttonUrl && project.cta.buttonText ? (
              <Link href={project.cta.buttonUrl} className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">{project.cta.buttonText}</Link>
            ) : null}
          </div>
        ) : null}
      </Container>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    </section>
  );
}
