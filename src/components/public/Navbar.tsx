import Link from "next/link";
import Container from "@/components/shared/Container";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about-us", label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/careers", label: "Careers" },
  { href: "/contact-us", label: "Contact" },
];

export default function Navbar() {
  return (
    <nav className="bg-background border-b border-border sticky top-0 z-40 shadow-sm">
      <Container className="flex items-center justify-between h-16">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold text-primary tracking-tight"
          aria-label="UESPAK – Go to home"
        >
          UESPAK
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-6 list-none m-0 p-0">
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

        {/* CTA */}
        <Link
          href="/contact-us"
          className="hidden md:inline-flex items-center h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors duration-150"
        >
          Get in Touch
        </Link>

        {/* Mobile hamburger placeholder – to be replaced with full menu */}
        <button
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
