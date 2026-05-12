import Link from "next/link";
import Container from "@/components/shared/Container";
import type { PublicSiteSettings } from "@/types/site-settings";

const footerLinks = [
  { href: "/about-us", label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/careers", label: "Careers" },
  { href: "/contact-us", label: "Contact" },
];

interface FooterProps {
  settings: PublicSiteSettings;
}

export default function Footer({ settings }: FooterProps) {
  const siteName = settings.siteName?.trim() || "UESPAK";
  const year = new Date().getFullYear();
  const footerDesc =
    settings.footerDescription?.trim() ||
    settings.footerText?.trim() ||
    `${siteName} delivers world-class engineering, procurement, and construction services across Pakistan and the broader region.`;
  const copy =
    settings.copyrightText?.trim() ||
    `© ${year} ${siteName}. All rights reserved.`;
  const phone = settings.primaryPhone?.trim();
  const email = settings.primaryEmail?.trim();
  const addr = settings.address?.trim();

  const socialRows = [...settings.socialLinks]
    .filter((s) => s.isActive !== false && s.url?.trim())
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <Container className="py-12 md:py-14">
        <div className="grid grid-cols-1 gap-y-10 gap-x-10 sm:grid-cols-2 md:grid-cols-[1.6fr_1fr_1.2fr] md:gap-x-12 lg:gap-x-16">
          <div className="sm:col-span-2 md:col-span-1 md:max-w-md">
            <Link
              href="/"
              aria-label={`${siteName} home`}
              className="group/footer-logo inline-flex items-center"
            >
              {settings.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.logoUrl}
                  alt={siteName}
                  width={300}
                  height={108}
                  className="h-16 w-auto object-contain transition-transform duration-300 group-hover/footer-logo:scale-[1.03] md:h-20"
                />
              ) : (
                <span className="block text-3xl font-extrabold tracking-tight text-primary-foreground md:text-4xl">
                  {siteName}
                </span>
              )}
            </Link>
            {settings.footerText?.trim() ? (
              <p className="mt-3 text-sm font-medium text-primary-foreground/85">
                {settings.footerText}
              </p>
            ) : null}
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-primary-foreground/70">
              {footerDesc}
            </p>
            {socialRows.length ? (
              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
                {socialRows.map((s) => (
                  <a
                    key={`${s.platform}-${s.url}`}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/80 transition-colors hover:text-primary-foreground"
                  >
                    {s.platform}
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <nav aria-label="Footer navigation" className="min-w-0">
            <h3 className="mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-primary-foreground/55">
              Quick Links
            </h3>
            <ul className="m-0 list-none space-y-2.5 p-0">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group/foot-link inline-flex items-center gap-1.5 text-sm text-primary-foreground/80 transition-all duration-200 hover:translate-x-0.5 hover:text-primary-foreground"
                  >
                    <span
                      aria-hidden="true"
                      className="h-px w-0 bg-current opacity-0 transition-all duration-200 group-hover/foot-link:w-3 group-hover/foot-link:opacity-100"
                    />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0">
            <h3 className="mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-primary-foreground/55">
              Contact
            </h3>
            <address className="space-y-2 not-italic text-sm leading-relaxed text-primary-foreground/80">
              {email ? (
                <p className="break-all">
                  <a
                    href={`mailto:${encodeURIComponent(email)}`}
                    className="transition-colors hover:text-primary-foreground hover:underline"
                  >
                    {email}
                  </a>
                </p>
              ) : null}
              {phone ? (
                <p>
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="transition-colors hover:text-primary-foreground hover:underline"
                  >
                    {phone}
                  </a>
                </p>
              ) : null}
              {addr ? <p className="max-w-xs">{addr}</p> : null}
            </address>
          </div>
        </div>

        <div className="mt-10 border-t border-primary-foreground/15 pt-6 text-center text-xs text-primary-foreground/55">
          {copy}
        </div>
      </Container>
    </footer>
  );
}
