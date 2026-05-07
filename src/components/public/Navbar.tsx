import Link from "next/link";
import Container from "@/components/shared/Container";
import type { PublicSiteSettings } from "@/types/site-settings";
import { getGroupedPublishedServices } from "@/lib/services";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about-us", label: "About Us" },
  { href: "/projects", label: "Projects" },
  { href: "/careers", label: "Careers" },
  { href: "/contact-us", label: "Contact" },
];

interface NavbarProps {
  settings: PublicSiteSettings;
}

export default async function Navbar({ settings }: NavbarProps) {
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

  const grouped = await getGroupedPublishedServices();
  const engineeringLinks = grouped.engineering.slice(0, 7);
  const agricultureLinks = grouped.agriculture.slice(0, 7);

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

          <li className="relative group">
            <Link
              href="/services"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors duration-150"
            >
              Services
            </Link>
            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-all duration-150 absolute left-1/2 -translate-x-1/2 top-full pt-3">
              <div className="w-[720px] max-w-[85vw] rounded-xl border border-border bg-card shadow-lg p-5">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Engineering Services
                      </h3>
                      <Link
                        href="/services/group/engineering"
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        View all
                      </Link>
                    </div>
                    {engineeringLinks.length ? (
                      <ul className="mt-3 space-y-2">
                        {engineeringLinks.map((s) => (
                          <li key={String(s._id)}>
                            <Link
                              href={`/services/${s.slug}`}
                              className="block rounded-md px-2 py-1.5 text-sm text-foreground/85 hover:bg-accent hover:text-foreground transition-colors"
                            >
                              {s.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-muted-foreground">
                        Browse engineering services.
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Agriculture Services
                      </h3>
                      <Link
                        href="/services/group/agriculture"
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        View all
                      </Link>
                    </div>
                    {agricultureLinks.length ? (
                      <ul className="mt-3 space-y-2">
                        {agricultureLinks.map((s) => (
                          <li key={String(s._id)}>
                            <Link
                              href={`/services/${s.slug}`}
                              className="block rounded-md px-2 py-1.5 text-sm text-foreground/85 hover:bg-accent hover:text-foreground transition-colors"
                            >
                              {s.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-muted-foreground">
                        Browse agriculture services.
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                  <Link
                    href="/services"
                    className="text-sm font-semibold text-foreground/85 hover:text-primary transition-colors"
                  >
                    View All Services
                  </Link>
                  <Link
                    href="/contact-us"
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Contact us
                  </Link>
                </div>
              </div>
            </div>
          </li>
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
