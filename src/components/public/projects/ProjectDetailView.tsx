import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Calendar,
  Check,
  Mail,
  MapPin,
  Phone,
  Wrench,
} from "lucide-react";
import Container from "@/components/shared/Container";
import DetailHero from "@/components/public/catalog/DetailHero";
import PremiumGallery from "@/components/public/catalog/PremiumGallery";
import CatalogBottomCta from "@/components/public/catalog/CatalogBottomCta";
import type { IProject } from "@/models/Project";
import {
  getProjectGroupLabel,
  getProjectGroupSlug,
} from "@/types/project";
import type { PublicSiteSettings } from "@/types/site-settings";

interface LinkedService {
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: { url?: string; altText?: string };
}

interface ProjectDetailViewProps {
  project: IProject;
  linkedServices: LinkedService[];
  settings: PublicSiteSettings;
}

function projectGroupOf(project: IProject) {
  return project.projectGroup === "agriculture"
    ? "agriculture"
    : project.projectGroup === "industrialAutomation"
      ? "industrialAutomation"
      : "engineering";
}

function formatDate(value?: Date | string) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function IconListSection({
  title,
  items,
  numbered,
}: {
  title: string;
  items: string[];
  numbered?: boolean;
}) {
  if (!items.length) return null;
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#075f3f]">
        {title}
      </h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {items.map((item, idx) => (
          <li
            key={idx}
            className="homepage-card-rise flex h-full gap-3 rounded-xl border border-emerald-900/8 bg-white p-4 shadow-sm"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#075f3f]/10 text-sm font-bold text-[#075f3f]">
              {numbered ? idx + 1 : <Check className="h-4 w-4" />}
            </span>
            <span className="text-sm leading-relaxed text-slate-700">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function ProjectDetailView({
  project,
  linkedServices,
  settings,
}: ProjectDetailViewProps) {
  const group = projectGroupOf(project);
  const groupLabel = getProjectGroupLabel(group);
  const groupSlug = getProjectGroupSlug(group);
  const commissioning = formatDate(project.commissioningDate);
  const gallery = (project.gallery || []).filter((g) => g?.url);
  const scopeItems = (project.scopeItems || []).filter(Boolean);
  const servicesProvided = (project.servicesProvided || []).filter(Boolean);
  const technologies = (project.technologies || []).filter(Boolean);
  const outcomes = (project.outcomes || []).filter(Boolean);

  const metaChips = [
    project.client ? { label: "Client", value: project.client } : null,
    project.location ? { label: "Location", value: project.location } : null,
    project.discipline ? { label: "Discipline", value: project.discipline } : null,
    commissioning ? { label: "Commissioned", value: commissioning } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <>
      <DetailHero
        title={project.title}
        excerpt={project.excerpt}
        badge={groupLabel}
        backgroundImageUrl={project.featuredImage?.url}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Projects", href: "/projects" },
          { label: groupLabel, href: `/projects/group/${groupSlug}` },
          { label: project.title },
        ]}
        metaChips={metaChips}
      />

      <section className="w-full bg-[#f7fbf8] py-12 md:py-16 lg:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start lg:gap-12 xl:grid-cols-[1fr_360px]">
            <div className="min-w-0 space-y-12">
              {(project.excerpt || project.description) && (
                <section>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#075f3f]">
                    Project Overview
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-slate-700 md:text-lg">
                    {project.description || project.excerpt}
                  </p>
                </section>
              )}

              {project.content ? (
                <section>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#075f3f]">
                    Project Details
                  </h2>
                  <article
                    className="prose prose-neutral mt-4 max-w-none prose-headings:text-[#0f172a] prose-a:text-[#075f3f]"
                    dangerouslySetInnerHTML={{ __html: project.content }}
                  />
                </section>
              ) : null}

              {project.scope ? (
                <section>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#075f3f]">
                    Scope of Work
                  </h2>
                  <p className="mt-4 rounded-xl border border-emerald-900/8 bg-white p-5 text-sm leading-relaxed text-slate-700 shadow-sm">
                    {project.scope}
                  </p>
                </section>
              ) : null}

              <IconListSection title="Scope Items" items={scopeItems} numbered />
              <IconListSection title="Services Provided" items={servicesProvided} />
              <IconListSection title="Technologies Used" items={technologies} />
              <IconListSection title="Outcomes" items={outcomes} />

              {gallery.length ? (
                <section>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#075f3f]">
                    Gallery
                  </h2>
                  <div className="mt-6">
                    <PremiumGallery images={gallery} title={project.title} />
                  </div>
                </section>
              ) : null}

              {linkedServices.length ? (
                <section>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#075f3f]">
                    Linked Services
                  </h2>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {linkedServices.map((service) => (
                      <Link
                        key={service.slug}
                        href={`/services/${service.slug}`}
                        className="homepage-card-rise group flex gap-4 rounded-xl border border-emerald-900/8 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-400/50"
                      >
                        {service.featuredImage?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={service.featuredImage.url}
                            alt={service.featuredImage.altText || service.title}
                            className="h-16 w-16 shrink-0 rounded-lg object-cover"
                          />
                        ) : (
                          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-[#075f3f]/10 text-sm font-bold text-[#075f3f]">
                            {service.title.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block font-semibold text-[#0f172a] group-hover:text-[#075f3f]">
                            {service.title}
                          </span>
                          {service.excerpt ? (
                            <span className="mt-1 line-clamp-2 block text-xs text-slate-500">
                              {service.excerpt}
                            </span>
                          ) : null}
                          <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#075f3f]">
                            View service
                            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}

              {project.cta?.isActive ? (
                <section className="rounded-2xl border border-[#075f3f]/20 bg-gradient-to-br from-[#075f3f]/10 to-white p-6 md:p-8">
                  {project.cta.title ? (
                    <h2 className="text-xl font-bold text-[#0f172a]">{project.cta.title}</h2>
                  ) : null}
                  {project.cta.description ? (
                    <p className="mt-2 text-sm text-slate-600">{project.cta.description}</p>
                  ) : null}
                  {project.cta.buttonUrl && project.cta.buttonText ? (
                    <Link
                      href={project.cta.buttonUrl}
                      className="group mt-5 inline-flex items-center gap-2 rounded-full bg-[#075f3f] px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#064d34]"
                    >
                      {project.cta.buttonText}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  ) : null}
                </section>
              ) : null}
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-emerald-900/8 bg-white p-6 shadow-[0_14px_32px_rgba(7,95,63,0.08)]">
                <h3 className="text-lg font-bold text-[#0f172a]">Project Details</h3>
                <dl className="mt-5 space-y-4 text-sm">
                  {project.client ? (
                    <div className="flex gap-3">
                      <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-[#075f3f]" />
                      <div>
                        <dt className="font-semibold text-slate-500">Client</dt>
                        <dd className="text-[#0f172a]">{project.client}</dd>
                      </div>
                    </div>
                  ) : null}
                  {project.site ? (
                    <div className="flex gap-3">
                      <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-[#075f3f]" />
                      <div>
                        <dt className="font-semibold text-slate-500">Site</dt>
                        <dd className="text-[#0f172a]">{project.site}</dd>
                      </div>
                    </div>
                  ) : null}
                  {project.location ? (
                    <div className="flex gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#075f3f]" />
                      <div>
                        <dt className="font-semibold text-slate-500">Location</dt>
                        <dd className="text-[#0f172a]">{project.location}</dd>
                      </div>
                    </div>
                  ) : null}
                  {project.discipline ? (
                    <div className="flex gap-3">
                      <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-[#075f3f]" />
                      <div>
                        <dt className="font-semibold text-slate-500">Discipline</dt>
                        <dd className="text-[#0f172a]">{project.discipline}</dd>
                      </div>
                    </div>
                  ) : null}
                  {commissioning ? (
                    <div className="flex gap-3">
                      <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#075f3f]" />
                      <div>
                        <dt className="font-semibold text-slate-500">Commissioning</dt>
                        <dd className="text-[#0f172a]">{commissioning}</dd>
                      </div>
                    </div>
                  ) : null}
                  <div className="flex gap-3">
                    <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-[#075f3f]" />
                    <div>
                      <dt className="font-semibold text-slate-500">Group</dt>
                      <dd className="text-[#0f172a]">{groupLabel}</dd>
                    </div>
                  </div>
                </dl>
                <Link
                  href="/contact-us"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#075f3f] px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-[#064d34]"
                >
                  <Mail className="h-4 w-4" />
                  Discuss This Project
                </Link>
                {settings.primaryPhone ? (
                  <a
                    href={`tel:${settings.primaryPhone.replace(/\s/g, "")}`}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-emerald-900/15 px-4 py-3 text-sm font-semibold text-[#075f3f] transition-colors hover:border-emerald-400"
                  >
                    <Phone className="h-4 w-4" />
                    {settings.primaryPhone}
                  </a>
                ) : null}
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <CatalogBottomCta
        title="Planning a similar project?"
        description="Share your scope and site requirements—UESPAK will propose a practical delivery approach."
        buttonText="Start a Conversation"
        buttonHref="/contact-us"
      />
    </>
  );
}
