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
      <Container className="py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <span className="text-xl font-bold tracking-tight">{siteName}</span>
            {settings.footerText?.trim() ? (
              <p className="mt-2 text-sm font-medium text-primary-foreground/85">
                {settings.footerText}
              </p>
            ) : null}
            <p className="mt-2 text-sm text-primary-foreground/70 leading-relaxed">
              {footerDesc}
            </p>
            {socialRows.length ? (
              <div className="mt-4 flex flex-wrap gap-3">
                {socialRows.map((s) => (
                  <a
                    key={`${s.platform}-${s.url}`}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold uppercase tracking-wide text-primary-foreground/80 hover:text-primary-foreground"
                  >
                    {s.platform}
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <nav aria-label="Footer navigation">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground/50">
              Quick Links
            </h3>
            <ul className="space-y-2 list-none p-0 m-0">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground/50">
              Contact
            </h3>
            <address className="not-italic text-sm text-primary-foreground/80 space-y-1">
              {email ? (
                <p>
                  <a href={`mailto:${encodeURIComponent(email)}`} className="hover:underline">
                    {email}
                  </a>
                </p>
              ) : null}
              {phone ? (
                <p>
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="hover:underline"
                  >
                    {phone}
                  </a>
                </p>
              ) : null}
              {addr ? <p>{addr}</p> : null}
            </address>
          </div>
        </div>

        <div className="mt-8 border-t border-primary-foreground/20 pt-6 text-center text-xs text-primary-foreground/50">
          {copy}
        </div>
      </Container>
    </footer>
  );
}
