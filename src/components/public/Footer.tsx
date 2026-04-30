import Link from "next/link";
import Container from "@/components/shared/Container";

const footerLinks = [
  { href: "/about-us", label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/careers", label: "Careers" },
  { href: "/contact-us", label: "Contact" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <Container className="py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <span className="text-xl font-bold tracking-tight">UESPAK</span>
            <p className="mt-2 text-sm text-primary-foreground/70 leading-relaxed">
              Engineering Excellence. Delivering world-class EPC solutions
              across Pakistan and beyond.
            </p>
          </div>

          {/* Quick links */}
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

          {/* Contact */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground/50">
              Contact
            </h3>
            <address className="not-italic text-sm text-primary-foreground/80 space-y-1">
              <p>services@uespak.com</p>
              <p>+92 XXX XXXXXXX</p>
              <p>Islamabad, Pakistan</p>
            </address>
          </div>
        </div>

        <div className="mt-8 border-t border-primary-foreground/20 pt-6 text-center text-xs text-primary-foreground/50">
          © {year} UESPAK. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
