"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import Container from "@/components/shared/Container";
import type { PublicSiteSettings } from "@/types/site-settings";

interface NavItem {
  href: string;
  label: string;
}

interface NavEntry {
  title: string;
  viewAllHref: string;
  links: NavItem[];
}

interface NavbarClientProps {
  settings: PublicSiteSettings;
  servicesMenu: NavEntry[];
  projectsMenu: NavEntry[];
}

const navLinks: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/about-us", label: "About Us" },
  { href: "/careers", label: "Careers" },
  { href: "/contact-us", label: "Contact" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function NavbarClient({
  settings,
  servicesMenu,
  projectsMenu,
}: NavbarClientProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isHome = pathname === "/";
  const ctaHref =
    settings.globalCTA?.isActive && settings.globalCTA.buttonUrl?.trim()
      ? settings.globalCTA.buttonUrl.trim()
      : "/contact-us";
  const ctaLabel =
    settings.globalCTA?.isActive && settings.globalCTA.buttonText?.trim()
      ? settings.globalCTA.buttonText.trim()
      : "Get in Touch";
  const ctaIsAbsolute = /^https?:\/\//i.test(ctaHref);
  const siteName = settings.siteName?.trim() || "UESPAK";

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const shellClass =
    isHome && !isScrolled
      ? "bg-white/[0.04] border-white/15 text-white"
      : "bg-white/90 border-black/10 text-foreground shadow-[0_8px_30px_rgba(2,33,23,0.12)]";

  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <div className={`hidden md:block border-b ${isHome && !isScrolled ? "border-white/20 bg-transparent text-white" : "border-black/8 bg-white/75 text-foreground backdrop-blur-md"}`}>
        <Container className="flex h-9 items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            {settings.primaryPhone ? (
              <a href={`tel:${settings.primaryPhone.replace(/\s+/g, "")}`} className="opacity-90 transition-opacity hover:opacity-100">
                {settings.primaryPhone}
              </a>
            ) : null}
            {settings.primaryEmail ? (
              <a href={`mailto:${encodeURIComponent(settings.primaryEmail)}`} className="opacity-90 transition-opacity hover:opacity-100">
                {settings.primaryEmail}
              </a>
            ) : null}
          </div>
          <p className="truncate opacity-85">{settings.address || "Pakistan"}</p>
        </Container>
      </div>

      <div className={`border-b backdrop-blur-xl transition-all duration-300 ${shellClass}`}>
        <Container className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="shrink-0" aria-label={`${siteName} home`}>
            {settings.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.logoUrl}
                alt={siteName}
                width={170}
                height={52}
                className="h-11 w-auto object-contain"
              />
            ) : (
              <span className="text-2xl font-bold tracking-tight">{siteName}</span>
            )}
          </Link>

          <ul className="hidden flex-1 items-center justify-center gap-6 md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative text-sm font-medium transition-colors ${
                    isActive(pathname, link.href)
                      ? "text-[#0c8b59]"
                      : isHome && !isScrolled
                        ? "text-white/90 hover:text-white"
                        : "text-foreground/80 hover:text-[#075f3f]"
                  } after:absolute after:-bottom-1.5 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-[#0c8b59] after:transition-transform hover:after:scale-x-100`}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            <li className="group relative">
              <Link href="/services" className={`inline-flex items-center gap-1 text-sm font-medium transition-colors ${isHome && !isScrolled ? "text-white/90 hover:text-white" : "text-foreground/80 hover:text-[#075f3f]"}`}>
                Services <ChevronDown className="h-4 w-4" />
              </Link>
              <div className="invisible absolute left-1/2 top-full w-[760px] max-w-[92vw] -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                <div className="rounded-2xl border border-black/10 bg-white/95 p-5 text-foreground shadow-[0_20px_45px_rgba(15,23,42,0.16)] backdrop-blur">
                  <div className="grid grid-cols-2 gap-6">
                    {servicesMenu.map((group) => (
                      <div key={group.title}>
                        <div className="mb-2 flex items-center justify-between">
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group.title}</h3>
                          <Link href={group.viewAllHref} className="text-xs font-semibold text-[#075f3f] hover:underline">View all</Link>
                        </div>
                        {group.links.length ? group.links.map((link) => (
                          <Link key={`${group.title}-${link.href}`} href={link.href} className="mt-1 block rounded-md px-2 py-1.5 text-sm text-foreground/85 transition-colors hover:bg-[#edf7f1] hover:text-foreground">
                            {link.label}
                          </Link>
                        )) : <p className="mt-2 text-sm text-muted-foreground">No services published yet.</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </li>

            <li className="group relative">
              <Link href="/projects" className={`inline-flex items-center gap-1 text-sm font-medium transition-colors ${isHome && !isScrolled ? "text-white/90 hover:text-white" : "text-foreground/80 hover:text-[#075f3f]"}`}>
                Projects <ChevronDown className="h-4 w-4" />
              </Link>
              <div className="invisible absolute left-1/2 top-full w-[920px] max-w-[94vw] -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                <div className="rounded-2xl border border-black/10 bg-white/95 p-5 text-foreground shadow-[0_20px_45px_rgba(15,23,42,0.16)] backdrop-blur">
                  <div className="grid grid-cols-3 gap-6">
                    {projectsMenu.map((group) => (
                      <div key={group.title}>
                        <div className="mb-2 flex items-center justify-between">
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group.title}</h3>
                          <Link href={group.viewAllHref} className="text-xs font-semibold text-[#075f3f] hover:underline">View all</Link>
                        </div>
                        {group.links.length ? group.links.map((link) => (
                          <Link key={`${group.title}-${link.href}`} href={link.href} className="mt-1 block rounded-md px-2 py-1.5 text-sm text-foreground/85 transition-colors hover:bg-[#edf7f1] hover:text-foreground">
                            {link.label}
                          </Link>
                        )) : <p className="mt-2 text-sm text-muted-foreground">No projects published yet.</p>}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 border-t border-black/10 pt-4">
                    <Link href="/projects" className="text-sm font-semibold text-[#075f3f] hover:underline">
                      View All Projects
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          </ul>

          <div className="hidden items-center gap-2 md:flex">
            {ctaIsAbsolute ? (
              <a
                href={ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-all ${
                  isHome && !isScrolled
                    ? "bg-white text-[#075f3f] hover:bg-emerald-50 shadow-[0_10px_24px_rgba(0,0,0,0.2)]"
                    : "bg-[#075f3f] text-white hover:bg-[#03452e] shadow-sm"
                }`}
              >
                {ctaLabel}
              </a>
            ) : (
              <Link
                href={ctaHref}
                className={`inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-all ${
                  isHome && !isScrolled
                    ? "bg-white text-[#075f3f] hover:bg-emerald-50 shadow-[0_10px_24px_rgba(0,0,0,0.2)]"
                    : "bg-[#075f3f] text-white hover:bg-[#03452e] shadow-sm"
                }`}
              >
                {ctaLabel}
              </Link>
            )}
          </div>

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((prev) => !prev)}
            className={`rounded-md p-2 md:hidden ${isHome && !isScrolled ? "text-white" : "text-foreground"} transition-colors`}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </Container>
      </div>

      {menuOpen ? (
        <div className="border-b border-black/10 bg-white/95 shadow-md backdrop-blur md:hidden">
          <Container className="py-3">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link key={`mobile-${link.href}`} href={link.href} onClick={() => setMenuOpen(false)} className="block rounded-md px-3 py-2 text-sm font-medium text-foreground/90 hover:bg-[#edf7f1]">
                  {link.label}
                </Link>
              ))}
              <Link href="/services" onClick={() => setMenuOpen(false)} className="block rounded-md px-3 py-2 text-sm font-medium text-foreground/90 hover:bg-[#edf7f1]">Services</Link>
              <Link href="/projects" onClick={() => setMenuOpen(false)} className="block rounded-md px-3 py-2 text-sm font-medium text-foreground/90 hover:bg-[#edf7f1]">Projects</Link>
              <Link href={ctaHref} onClick={() => setMenuOpen(false)} className="mt-2 inline-flex h-10 items-center rounded-lg bg-[#075f3f] px-4 text-sm font-semibold text-white">
                {ctaLabel}
              </Link>
            </div>
          </Container>
        </div>
      ) : null}
    </div>
  );
}

