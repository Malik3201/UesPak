import Link from "next/link";

import type { HomePageClientLogo } from "@/types/home-page";

interface ClientsMobileMarqueeProps {
  logos: HomePageClientLogo[];
  durationSeconds?: number;
}

/**
 * Continuous logo strip used on small screens for the "Trusted By" section.
 *
 * The marquee uses a CSS keyframe (defined in globals.css) that translates the
 * track from 0 to -50%; the logo list is duplicated once in the DOM so the
 * loop is seamless. Speed is slightly faster than a typical marquee per the
 * design brief.
 */
export default function ClientsMobileMarquee({
  logos,
  durationSeconds = 18,
}: ClientsMobileMarqueeProps) {
  if (!logos.length) return null;

  const repeated = [...logos, ...logos];

  return (
    <div
      className="relative -mx-4 overflow-hidden"
      aria-label="Trusted clients and partners"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#f7fbf8] to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#f7fbf8] to-transparent"
      />
      <ul
        className="homepage-marquee-track flex items-stretch gap-3 px-4"
        style={
          {
            ["--marquee-duration"]: `${durationSeconds}s`,
          } as React.CSSProperties
        }
      >
        {repeated.map((client, idx) => {
          const isClone = idx >= logos.length;
          const tile = (
            <div className="flex h-20 w-36 shrink-0 items-center justify-center rounded-2xl border border-emerald-900/5 bg-white px-4 shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
              {client.logo?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={client.logo.url}
                  alt={client.logo.altText || client.name}
                  loading="lazy"
                  className="max-h-10 w-auto object-contain"
                />
              ) : (
                <p className="line-clamp-2 text-center text-[0.78rem] font-bold leading-tight text-foreground">
                  {client.name}
                </p>
              )}
            </div>
          );

          return (
            <li
              key={`client-marquee-${idx}`}
              className="shrink-0"
              aria-hidden={isClone || undefined}
            >
              {client.url && !isClone ? (
                <Link
                  href={client.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit ${client.name}`}
                  className="block"
                >
                  {tile}
                </Link>
              ) : (
                tile
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
