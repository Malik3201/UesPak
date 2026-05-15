import Link from "next/link";
import Container from "@/components/shared/Container";
import type { CatalogBreadcrumb } from "@/components/public/catalog/CatalogHero";

interface DetailHeroProps {
  title: string;
  excerpt?: string;
  badge?: string;
  backgroundImageUrl?: string;
  breadcrumbs: CatalogBreadcrumb[];
  metaChips?: Array<{ label: string; value: string }>;
}

export default function DetailHero({
  title,
  excerpt,
  badge,
  backgroundImageUrl,
  breadcrumbs,
  metaChips,
}: DetailHeroProps) {
  const bg = backgroundImageUrl?.trim();

  return (
    <section
      className="homepage-section-reveal relative isolate min-h-[360px] overflow-hidden bg-[#052f21] py-20 text-white md:min-h-[420px] md:py-24 lg:min-h-[460px]"
      style={{
        backgroundImage: bg
          ? `linear-gradient(135deg, rgba(3,39,28,0.92), rgba(5,47,33,0.82), rgba(2,18,14,0.9)), url("${bg}")`
          : "linear-gradient(135deg,#052f21 0%,#075f3f 55%,#021b14 100%)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div aria-hidden className="absolute inset-0 bg-[#021b14]/25" />
      <Container className="relative z-10">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-emerald-100/90">
          <ol className="flex flex-wrap items-center gap-1.5">
            {breadcrumbs.map((crumb, idx) => (
              <li key={`${crumb.label}-${idx}`} className="flex items-center gap-1.5">
                {idx > 0 ? <span className="text-emerald-200/50">/</span> : null}
                {crumb.href ? (
                  <Link href={crumb.href} className="transition-colors hover:text-white">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-medium text-white">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {badge ? (
          <span className="inline-flex rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#075f3f]">
            {badge}
          </span>
        ) : null}

        <h1 className="mt-4 max-w-4xl text-balance text-3xl font-extrabold leading-tight tracking-tight md:text-4xl lg:text-5xl">
          {title}
        </h1>
        {excerpt ? (
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-emerald-50/90 md:text-lg">
            {excerpt}
          </p>
        ) : null}

        {metaChips?.length ? (
          <ul className="mt-6 flex flex-wrap gap-2">
            {metaChips.map((chip) => (
              <li
                key={chip.label}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs backdrop-blur-sm"
              >
                <span className="font-semibold uppercase tracking-wide text-emerald-100/80">
                  {chip.label}
                </span>
                <span className="text-white">{chip.value}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </Container>
    </section>
  );
}
