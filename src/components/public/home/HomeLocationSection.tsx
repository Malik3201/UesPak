import { MapPin, Mail, Phone, Clock3, ExternalLink } from "lucide-react";
import Container from "@/components/shared/Container";
import type { PublicSiteSettings } from "@/types/site-settings";

interface HomeLocationSectionProps {
  settings: PublicSiteSettings;
}

/**
 * Extract a safe iframe `src` URL from either:
 *  - a raw URL (already a Google Maps embed link, https://www.google.com/maps/embed?...)
 *  - or a full `<iframe ... src="..."></iframe>` HTML snippet pasted into the admin field.
 *
 * Returns `undefined` if no http(s) src can be found, so we never render an
 * unsafe / unsanitized iframe.
 */
function extractMapSrc(raw?: string): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const match = trimmed.match(/src\s*=\s*["']([^"']+)["']/i);
  if (match && /^https?:\/\//i.test(match[1])) {
    return match[1];
  }

  return undefined;
}

export default function HomeLocationSection({
  settings,
}: HomeLocationSectionProps) {
  const mapSrc = extractMapSrc(settings.mapEmbedUrl);
  const address = settings.address?.trim();
  const email = settings.primaryEmail?.trim();
  const phone = settings.primaryPhone?.trim();
  const workingHours = settings.workingHours?.trim();

  const hasDetails = Boolean(address || email || phone || workingHours);

  return (
    <section className="homepage-section-reveal relative overflow-hidden bg-[#f7faf8] py-16 md:py-20 lg:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_85%_20%,rgba(7,95,63,0.08),transparent_55%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-1/4 hidden h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(7,95,63,0.07),transparent_70%)] lg:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-700/15 to-transparent"
      />

      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-700/15 bg-white px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[#075f3f] shadow-sm">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            Our Location
          </span>
          <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl lg:text-[2.6rem]">
            Visit UESPAK
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            Find our office location and get directions easily through the
            embedded map.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:mt-14 lg:grid-cols-[1.6fr_1fr] lg:gap-8">
          <div className="homepage-card-rise relative overflow-hidden rounded-3xl border border-emerald-900/5 bg-white shadow-[0_24px_56px_rgba(7,95,63,0.10)] ring-1 ring-emerald-900/[0.03]">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#075f3f] via-emerald-500 to-[#075f3f]"
            />
            {mapSrc ? (
              <iframe
                src={mapSrc}
                title="UESPAK office location map"
                width="100%"
                height="100%"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                className="block h-[360px] w-full border-0 sm:h-[420px] md:h-[480px] lg:h-[560px] xl:h-[600px]"
              />
            ) : (
              <div className="flex h-[360px] w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_50%_40%,rgba(7,95,63,0.08),transparent_70%)] px-6 text-center sm:h-[420px] md:h-[480px] lg:h-[560px]">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-[#075f3f]">
                  <MapPin className="h-7 w-7" aria-hidden="true" />
                </div>
                <p className="text-base font-semibold text-foreground">
                  Map location will be available soon.
                </p>
                {address ? (
                  <p className="max-w-sm text-sm text-muted-foreground">
                    {address}
                  </p>
                ) : null}
              </div>
            )}
          </div>

          <aside className="homepage-card-rise flex flex-col gap-5 rounded-3xl border border-emerald-900/5 bg-white p-6 shadow-[0_20px_44px_rgba(7,95,63,0.08)] md:p-8">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-px w-8 bg-[#075f3f]"
              />
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#075f3f]">
                Get in touch
              </p>
            </div>
            <h3 className="text-xl font-bold leading-snug text-foreground md:text-2xl">
              UESPAK Office
            </h3>

            {hasDetails ? (
              <ul className="space-y-4 text-sm text-muted-foreground md:text-[0.95rem]">
                {address ? (
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-9 w-9 flex-none place-items-center rounded-xl bg-emerald-50 text-[#075f3f]">
                      <MapPin className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-foreground/60">
                        Address
                      </p>
                      <p className="mt-1 leading-relaxed text-foreground/85">
                        {address}
                      </p>
                    </div>
                  </li>
                ) : null}
                {email ? (
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-9 w-9 flex-none place-items-center rounded-xl bg-emerald-50 text-[#075f3f]">
                      <Mail className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-foreground/60">
                        Email
                      </p>
                      <a
                        href={`mailto:${encodeURIComponent(email)}`}
                        className="mt-1 inline-block break-all leading-relaxed text-foreground/85 transition-colors hover:text-[#075f3f] hover:underline"
                      >
                        {email}
                      </a>
                    </div>
                  </li>
                ) : null}
                {phone ? (
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-9 w-9 flex-none place-items-center rounded-xl bg-emerald-50 text-[#075f3f]">
                      <Phone className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-foreground/60">
                        Phone
                      </p>
                      <a
                        href={`tel:${phone.replace(/\s+/g, "")}`}
                        className="mt-1 inline-block leading-relaxed text-foreground/85 transition-colors hover:text-[#075f3f] hover:underline"
                      >
                        {phone}
                      </a>
                    </div>
                  </li>
                ) : null}
                {workingHours ? (
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-9 w-9 flex-none place-items-center rounded-xl bg-emerald-50 text-[#075f3f]">
                      <Clock3 className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-foreground/60">
                        Working hours
                      </p>
                      <p className="mt-1 leading-relaxed text-foreground/85">
                        {workingHours}
                      </p>
                    </div>
                  </li>
                ) : null}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Detailed contact information will be available soon.
              </p>
            )}

            {mapSrc ? (
              <a
                href={mapSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="group/loc-btn mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#075f3f] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(7,95,63,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#03452e]"
              >
                Open in Google Maps
                <ExternalLink
                  className="h-4 w-4 transition-transform duration-300 group-hover/loc-btn:translate-x-0.5"
                  aria-hidden="true"
                />
              </a>
            ) : null}
          </aside>
        </div>
      </Container>
    </section>
  );
}
