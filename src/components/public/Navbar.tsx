import Link from "next/link";
import Container from "@/components/shared/Container";
import type { PublicSiteSettings } from "@/types/site-settings";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about-us", label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/careers", label: "Careers" },
  { href: "/contact-us", label: "Contact" },
];

interface NavbarProps {
  settings: PublicSiteSettings;
}

export default function Navbar({ settings }: NavbarProps) {
  const pdfUrl = settings.profilePdfUrl?.trim();
  const profileLabel =
    settings.profileButtonText?.trim() || "Download Profile";
  const siteName = settings.siteName?.trim() || "UESPAK";

  const ctaHref =
    settings.globalCTA?.isActive && settings.globalCTA.buttonUrl?.trim()
      ? settings.globalCTA.buttonUrl.trim()
      : "/contact-us";

  const ctaLabel =
    settings.globalCTA?.isActive && settings.globalCTA.buttonText?.trim()
      ? settings.globalCTA.buttonText.trim()
      : "Get in Touch";

  const ctaIsAbsolute = /^https?:\/\//i.test(ctaHref);

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-40 shadow-sm">
      <Container className="flex items-center justify-between h-16 gap-4">
        <Link
          href="/"
          className="flex items-center shrink-0"
          aria-label={`${siteName} – Go to home`}
        >
          {settings.logoUrl?.trim() ? (
            <>
              {/* Remote CMS logo URL */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={settings.logoUrl}
                alt={siteName}
                width={132}
                height={40}
                className="h-9 w-auto object-contain"
              />
            </>
          ) : (
            <span className="text-xl font-bold text-primary tracking-tight">{siteName}</span>
          )}
        </Link>

        <ul className="hidden md:flex flex-1 items-center justify-center gap-6 list-none m-0 p-0">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors duration-150"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-2 shrink-0">
          {pdfUrl ? (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center h-9 px-3 rounded-md border border-border bg-background text-foreground text-sm font-semibold hover:bg-accent transition-colors duration-150"
            >
              {profileLabel}
            </a>
          ) : null}
          {ctaIsAbsolute ? (
            <a
              href={ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors duration-150"
            >
              {ctaLabel}
            </a>
          ) : (
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors duration-150"
            >
              {ctaLabel}
            </Link>
          )}
        </div>

        <button
          type="button"
          className="md:hidden p-2 rounded-md text-foreground hover:bg-accent transition-colors"
          aria-label="Open menu"
          id="mobile-menu-toggle"
        >
          <span className="block w-5 h-0.5 bg-current mb-1" />
          <span className="block w-5 h-0.5 bg-current mb-1" />
          <span className="block w-5 h-0.5 bg-current" />
        </button>
      </Container>
    </nav>
  );
}
