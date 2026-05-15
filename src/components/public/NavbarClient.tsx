"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Container from "@/components/shared/Container";
import { MobileCatalogNav, NavFlyoutMenu } from "@/components/public/NavCatalogMenus";
import type { NavMenuGroup } from "@/lib/nav-menu";
import type { PublicSiteSettings } from "@/types/site-settings";

interface NavItem {
  href: string;
  label: string;
}

interface NavbarClientProps {
  settings: PublicSiteSettings;
  servicesMenu: NavMenuGroup[];
  projectsMenu: NavMenuGroup[];
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
  const [openFlyoutMenu, setOpenFlyoutMenu] = useState<"services" | "projects" | null>(
    null
  );

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

  const navLinkClass = (href: string) =>
    isActive(pathname, href)
      ? "text-[#0c8b59]"
      : isHome && !isScrolled
        ? "text-white/90 hover:text-white"
        : "text-foreground/80 hover:text-[#075f3f]";

  const flyoutTriggerClass =
    isHome && !isScrolled
      ? "text-white/90 hover:text-white"
      : isActive(pathname, "/services") || isActive(pathname, "/projects")
        ? "text-[#0c8b59]"
        : "text-foreground/80 hover:text-[#075f3f]";

  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <div
        className={`hidden md:block border-b ${isHome && !isScrolled ? "border-white/20 bg-transparent text-white" : "border-black/8 bg-white/75 text-foreground backdrop-blur-md"}`}
      >
        <Container className="flex h-9 items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            {settings.primaryPhone ? (
              <a
                href={`tel:${settings.primaryPhone.replace(/\s+/g, "")}`}
                className="opacity-90 transition-opacity hover:opacity-100"
              >
                {settings.primaryPhone}
              </a>
            ) : null}
            {settings.primaryEmail ? (
              <a
                href={`mailto:${encodeURIComponent(settings.primaryEmail)}`}
                className="opacity-90 transition-opacity hover:opacity-100"
              >
                {settings.primaryEmail}
              </a>
            ) : null}
          </div>
          <p className="truncate opacity-85">{settings.address || "Pakistan"}</p>
        </Container>
      </div>

      <div className={`border-b backdrop-blur-xl transition-all duration-300 ${shellClass}`}>
        <Container className="flex h-16 items-center justify-between gap-4 md:h-20">
          <Link
            href="/"
            className="group/logo shrink-0"
            aria-label={`${siteName} home`}
          >
            {settings.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.logoUrl}
                alt={siteName}
                width={260}
                height={96}
                className="h-12 w-auto object-contain transition-transform duration-300 group-hover/logo:scale-[1.03] md:h-14 lg:h-16"
              />
            ) : (
              <span
                className={`block text-2xl font-extrabold tracking-tight transition-colors md:text-3xl lg:text-[2rem] ${
                  isHome && !isScrolled ? "text-white" : "text-[#075f3f]"
                }`}
              >
                {siteName}
              </span>
            )}
          </Link>

          <ul className="hidden flex-1 items-center justify-center gap-6 lg:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative text-sm font-medium transition-colors ${navLinkClass(link.href)} after:absolute after:-bottom-1.5 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-[#0c8b59] after:transition-transform hover:after:scale-x-100`}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            <NavFlyoutMenu
              id="nav-services"
              label="Services"
              href="/services"
              groups={servicesMenu}
              browseAllHref="/services"
              browseAllLabel="View All Services"
              itemCountLabel="services"
              isOpen={openFlyoutMenu === "services"}
              onOpen={() => setOpenFlyoutMenu("services")}
              onClose={() =>
                setOpenFlyoutMenu((prev) => (prev === "services" ? null : prev))
              }
              triggerClassName={flyoutTriggerClass}
            />

            <NavFlyoutMenu
              id="nav-projects"
              label="Projects"
              href="/projects"
              groups={projectsMenu}
              browseAllHref="/projects"
              browseAllLabel="View All Projects"
              itemCountLabel="projects"
              isOpen={openFlyoutMenu === "projects"}
              onOpen={() => setOpenFlyoutMenu("projects")}
              onClose={() =>
                setOpenFlyoutMenu((prev) => (prev === "projects" ? null : prev))
              }
              triggerClassName={flyoutTriggerClass}
            />
          </ul>

          <div className="hidden items-center gap-2 lg:flex">
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
            className={`rounded-md p-2 lg:hidden ${isHome && !isScrolled ? "text-white" : "text-foreground"} transition-colors`}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </Container>
      </div>

      {menuOpen ? (
        <div className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-black/10 bg-white/98 shadow-lg backdrop-blur lg:hidden">
          <Container className="py-4">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={`mobile-${link.href}`}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-[#edf7f1] ${
                    isActive(pathname, link.href)
                      ? "bg-[#edf7f1] text-[#075f3f]"
                      : "text-foreground/90"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <MobileCatalogNav
                servicesMenu={servicesMenu}
                projectsMenu={projectsMenu}
                onNavigate={() => setMenuOpen(false)}
              />

              <Link
                href={ctaHref}
                onClick={() => setMenuOpen(false)}
                className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#075f3f] px-4 text-sm font-semibold text-white shadow-sm"
              >
                {ctaLabel}
              </Link>
            </div>
          </Container>
        </div>
      ) : null}
    </div>
  );
}
