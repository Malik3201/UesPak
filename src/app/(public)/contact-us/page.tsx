import type { Metadata } from "next";
import { Clock3, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import Container from "@/components/shared/Container";
import PublicPageHero from "@/components/public/pages/PublicPageHero";
import ContactForm from "@/components/public/contact/ContactForm";
import { getContactPageContent, getPageSeoMetadata } from "@/lib/page-content";
import { getPublicSiteSettings } from "@/lib/site-settings";
import { SITE_URL } from "@/lib/seo";

function extractMapSrc(raw?: string): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const match = trimmed.match(/src\s*=\s*["']([^"']+)["']/i);
  if (match && /^https?:\/\//i.test(match[1])) return match[1];
  return undefined;
}

export async function generateMetadata(): Promise<Metadata> {
  const { pageContent } = await getContactPageContent();
  return getPageSeoMetadata(pageContent);
}

export default async function ContactPage() {
  const [{ pageContent: page }, settings] = await Promise.all([
    getContactPageContent(),
    getPublicSiteSettings(),
  ]);
  const s = page.sections;
  const phone = s.info.phone?.trim() || settings.primaryPhone;
  const email = s.info.email?.trim() || settings.primaryEmail;
  const address = s.info.address?.trim() || settings.address;
  const workingHours = s.info.workingHours?.trim() || settings.workingHours;
  const mapSrc = extractMapSrc(s.map.embedUrl || settings.mapEmbedUrl);

  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: page.seo.metaTitle || page.hero.title || "Contact UESPAK",
    description: page.seo.metaDescription || page.hero.description,
    url: `${SITE_URL}/contact-us`,
  };

  return (
    <>
      <PublicPageHero
        hero={page.hero}
        fallbackEyebrow="Contact"
        fallbackTitle="Contact UESPAK"
        fallbackDescription="Get in touch with UESPAK for project enquiries, service information, or general support."
      />

      {s.info.isActive ? (
        <section className="homepage-section-reveal bg-white py-16 md:py-20 lg:py-24">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#075f3f]">{s.info.eyebrow || "Get In Touch"}</p>
              <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">{s.info.title}</h2>
              <p className="mt-4 text-muted-foreground">{s.info.description}</p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {[
                [Phone, "Phone", phone, phone ? `tel:${phone.replace(/\s+/g, "")}` : undefined],
                [Mail, "Email", email, email ? `mailto:${email}` : undefined],
                [MapPin, "Address", address, undefined],
                [Clock3, "Working Hours", workingHours, undefined],
              ].map(([Icon, label, value, href], idx) => {
                const IconComponent = Icon as typeof Phone;
                if (!value) return null;
                const content = <p className="mt-2 text-sm leading-relaxed text-foreground/80">{String(value)}</p>;
                return (
                  <article key={idx} className="homepage-card-rise rounded-3xl border border-emerald-900/5 bg-[#f7fbf8] p-6 shadow-[0_12px_28px_rgba(7,95,63,0.06)]">
                    <IconComponent className="h-7 w-7 text-[#075f3f]" />
                    <h3 className="mt-4 font-bold text-foreground">{String(label)}</h3>
                    {href ? <a href={String(href)} className="hover:text-[#075f3f] hover:underline">{content}</a> : content}
                  </article>
                );
              })}
            </div>
          </Container>
        </section>
      ) : null}

      {s.form.isActive ? (
        <section className="homepage-section-reveal bg-[#f7fbf8] py-16 md:py-20 lg:py-24">
          <Container>
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#075f3f]">{s.form.eyebrow || "Send a Message"}</p>
                <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl">{s.form.title}</h2>
                <p className="mt-5 text-base leading-relaxed text-muted-foreground">{s.form.description}</p>
                <div className="mt-8 rounded-3xl bg-[#052f21] p-6 text-white">
                  <ShieldCheck className="h-8 w-8 text-emerald-200" />
                  <h3 className="mt-4 text-xl font-bold">Professional response</h3>
                  <p className="mt-2 text-sm leading-relaxed text-emerald-50/85">
                    Your enquiry is saved securely and routed to the right UESPAK team member for follow-up.
                  </p>
                </div>
              </div>
              <div className="rounded-3xl border border-emerald-900/5 bg-white p-5 shadow-[0_24px_54px_rgba(7,95,63,0.10)] md:p-8">
                <ContactForm
                  serviceOptions={s.form.serviceOptions}
                  submitButtonText={s.form.submitButtonText}
                  successMessage={s.form.successMessage}
                />
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      {s.map.isActive ? (
        <section className="homepage-section-reveal bg-white py-16 md:py-20 lg:py-24">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#075f3f]">{s.map.eyebrow || "Our Location"}</p>
              <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">{s.map.title}</h2>
              <p className="mt-4 text-muted-foreground">{s.map.description}</p>
            </div>
            <div className="mt-10 overflow-hidden rounded-3xl border border-emerald-900/5 bg-[#f7fbf8] shadow-[0_24px_54px_rgba(7,95,63,0.10)]">
              {mapSrc ? (
                <iframe
                  src={mapSrc}
                  title="UESPAK office location map"
                  width="100%"
                  height="100%"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                  className="block h-[360px] w-full border-0 sm:h-[420px] md:h-[520px]"
                />
              ) : (
                <div className="grid h-[360px] place-items-center p-8 text-center md:h-[520px]">
                  <div>
                    <MapPin className="mx-auto h-12 w-12 text-[#075f3f]" />
                    <p className="mt-4 font-semibold text-foreground">Map location will be available soon.</p>
                    {address ? <p className="mt-2 text-sm text-muted-foreground">{address}</p> : null}
                  </div>
                </div>
              )}
            </div>
          </Container>
        </section>
      ) : null}

      {s.support.isActive ? (
        <section className="homepage-section-reveal bg-[#052f21] py-16 text-white md:py-20 lg:py-24">
          <Container>
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-100">{s.support.eyebrow || "Support"}</p>
              <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">{s.support.title}</h2>
              <p className="mt-4 text-emerald-50/85">{s.support.description}</p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {s.support.items.map((item, idx) => (
                <article key={`${item.title}-${idx}`} className="homepage-card-rise rounded-3xl border border-white/15 bg-white/[0.08] p-6 backdrop-blur-sm">
                  <h3 className="font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-emerald-50/82">{item.description}</p>
                </article>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }} />
    </>
  );
}
