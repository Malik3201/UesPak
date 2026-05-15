import Link from "next/link";
import {
  ArrowRight,
  Check,
  Download,
  FileText,
  Mail,
  Phone,
} from "lucide-react";
import Container from "@/components/shared/Container";
import DetailHero from "@/components/public/catalog/DetailHero";
import PremiumGallery from "@/components/public/catalog/PremiumGallery";
import CatalogBottomCta from "@/components/public/catalog/CatalogBottomCta";
import ServiceFaqAccordion from "@/components/public/services/ServiceFaqAccordion";
import ProjectCard, { type ProjectCardData } from "@/components/public/projects/ProjectCard";
import type { IService } from "@/models/Service";
import { getServiceGroup } from "@/lib/services";
import { getServiceGroupLabel } from "@/types/service";
import type { PublicSiteSettings } from "@/types/site-settings";

interface RelatedProject {
  title: string;
  slug: string;
  excerpt?: string;
  projectGroup?: ProjectCardData["projectGroup"];
  featuredImage?: IService["featuredImage"];
}

interface RelatedService {
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: IService["featuredImage"];
}

interface ServiceDetailViewProps {
  service: IService;
  relatedProjects: RelatedProject[];
  relatedServices: RelatedService[];
  settings: PublicSiteSettings;
}

export default function ServiceDetailView({
  service,
  relatedProjects,
  relatedServices,
  settings,
}: ServiceDetailViewProps) {
  const serviceGroup = getServiceGroup(service);
  const groupLabel = getServiceGroupLabel(serviceGroup);
  const bullets = (service.bulletPoints || []).filter(Boolean);
  const gallery = (service.gallery || []).filter((g) => g?.url);
  const faqs = (service.faqs || []).filter((f) => f.question && f.answer);

  const relatedProjectCards: ProjectCardData[] = relatedProjects.map((p, idx) => ({
    id: `related-${p.slug}-${idx}`,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    featuredImage: p.featuredImage,
    projectGroup: p.projectGroup || "engineering",
  }));

  return (
    <>
      <DetailHero
        title={service.title}
        excerpt={service.excerpt}
        badge={service.category?.trim() || groupLabel}
        backgroundImageUrl={service.featuredImage?.url}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: groupLabel, href: `/services/group/${serviceGroup}` },
          { label: service.title },
        ]}
      />

      <section className="w-full bg-[#f7fbf8] py-12 md:py-16 lg:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start lg:gap-12 xl:grid-cols-[1fr_360px]">
            <div className="min-w-0 space-y-12">
              {service.excerpt ? (
                <section>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#075f3f]">
                    Overview
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-slate-700 md:text-lg">
                    {service.excerpt}
                  </p>
                </section>
              ) : null}

              {service.content ? (
                <section>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#075f3f]">
                    Detailed Information
                  </h2>
                  <article
                    className="prose prose-neutral mt-4 max-w-none prose-headings:text-[#0f172a] prose-a:text-[#075f3f] prose-strong:text-[#0f172a]"
                    dangerouslySetInnerHTML={{ __html: service.content }}
                  />
                </section>
              ) : null}

              {bullets.length ? (
                <section>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#075f3f]">
                    Key Service Areas
                  </h2>
                  <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                    {bullets.map((point, idx) => (
                      <li
                        key={idx}
                        className="homepage-card-rise flex gap-3 rounded-xl border border-emerald-900/8 bg-white p-4 shadow-sm"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#075f3f]/10 text-[#075f3f]">
                          <Check className="h-4 w-4" />
                        </span>
                        <span className="text-sm leading-relaxed text-slate-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {gallery.length ? (
                <section>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#075f3f]">
                    Gallery
                  </h2>
                  <div className="mt-6">
                    <PremiumGallery images={gallery} title={service.title} />
                  </div>
                </section>
              ) : null}

              {faqs.length ? (
                <section>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#075f3f]">
                    Frequently Asked Questions
                  </h2>
                  <div className="mt-6">
                    <ServiceFaqAccordion faqs={faqs} />
                  </div>
                </section>
              ) : null}

              {relatedProjectCards.length ? (
                <section>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#075f3f]">
                    Related Projects
                  </h2>
                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    {relatedProjectCards.slice(0, 4).map((project) => (
                      <ProjectCard key={project.id} project={project} className="min-h-[380px]" />
                    ))}
                  </div>
                </section>
              ) : null}

              {service.cta?.isActive ? (
                <section className="rounded-2xl border border-[#075f3f]/20 bg-gradient-to-br from-[#075f3f]/10 to-white p-6 md:p-8">
                  {service.cta.title ? (
                    <h2 className="text-xl font-bold text-[#0f172a]">{service.cta.title}</h2>
                  ) : null}
                  {service.cta.description ? (
                    <p className="mt-2 text-sm text-slate-600">{service.cta.description}</p>
                  ) : null}
                  {service.cta.buttonUrl && service.cta.buttonText ? (
                    <Link
                      href={service.cta.buttonUrl}
                      className="group mt-5 inline-flex items-center gap-2 rounded-full bg-[#075f3f] px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#064d34]"
                    >
                      {service.cta.buttonText}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  ) : null}
                </section>
              ) : null}
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="space-y-6">
                <div className="rounded-2xl border border-emerald-900/8 bg-white p-6 shadow-[0_14px_32px_rgba(7,95,63,0.08)]">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-[#0f172a]">
                    <FileText className="h-5 w-5 text-[#075f3f]" />
                    Quick Info
                  </h3>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div>
                      <dt className="font-semibold text-slate-500">Service Group</dt>
                      <dd className="mt-0.5 text-[#0f172a]">{groupLabel}</dd>
                    </div>
                    {service.category ? (
                      <div>
                        <dt className="font-semibold text-slate-500">Category</dt>
                        <dd className="mt-0.5 text-[#0f172a]">{service.category}</dd>
                      </div>
                    ) : null}
                  </dl>
                  <Link
                    href="/contact-us"
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#075f3f] px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-[#064d34]"
                  >
                    <Mail className="h-4 w-4" />
                    Contact Us
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

                {settings.profilePdfUrl ? (
                  <a
                    href={settings.profilePdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-900/8 bg-white p-5 text-sm font-semibold text-[#075f3f] shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-400/50"
                  >
                    <Download className="h-4 w-4" />
                    {settings.profileButtonText || "Download Company Profile"}
                  </a>
                ) : null}

                {relatedServices.length ? (
                  <div className="rounded-2xl border border-emerald-900/8 bg-white p-6 shadow-sm">
                    <h3 className="text-base font-bold text-[#0f172a]">Related Services</h3>
                    <ul className="mt-4 space-y-3">
                      {relatedServices.map((item) => (
                        <li key={item.slug}>
                          <Link
                            href={`/services/${item.slug}`}
                            className="group flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-[#f7fbf8]"
                          >
                            {item.featuredImage?.url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.featuredImage.url}
                                alt=""
                                className="h-12 w-12 shrink-0 rounded-lg object-cover"
                              />
                            ) : (
                              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#075f3f]/10 text-xs font-bold text-[#075f3f]">
                                {item.title.slice(0, 2).toUpperCase()}
                              </span>
                            )}
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold text-[#0f172a] group-hover:text-[#075f3f]">
                                {item.title}
                              </span>
                              {item.excerpt ? (
                                <span className="mt-0.5 line-clamp-2 block text-xs text-slate-500">
                                  {item.excerpt}
                                </span>
                              ) : null}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <CatalogBottomCta />
    </>
  );
}
