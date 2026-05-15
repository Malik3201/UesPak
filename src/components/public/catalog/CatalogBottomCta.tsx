import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Container from "@/components/shared/Container";

interface CatalogBottomCtaProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
  backgroundImageUrl?: string;
}

export default function CatalogBottomCta({
  title = "Need a tailored solution?",
  description = "Tell us about your requirements—our team will recommend the right approach and next steps.",
  buttonText = "Contact UESPAK",
  buttonHref = "/contact-us",
  backgroundImageUrl,
}: CatalogBottomCtaProps) {
  const bg = backgroundImageUrl?.trim();

  return (
    <section
      className="homepage-section-reveal relative w-full overflow-hidden bg-[#052f21] py-16 text-white md:py-20"
      style={
        bg
          ? {
              backgroundImage: `linear-gradient(135deg, rgba(3,39,28,0.92), rgba(5,47,33,0.85)), url("${bg}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.08),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.05),transparent_40%)]"
      />
      <Container className="relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
          <p className="mt-4 text-sm leading-relaxed text-emerald-50/90 md:text-base">
            {description}
          </p>
          <Link
            href={buttonHref}
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#075f3f] shadow-[0_16px_32px_rgba(0,0,0,0.22)] transition-all hover:-translate-y-0.5 hover:bg-emerald-50"
          >
            {buttonText}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
