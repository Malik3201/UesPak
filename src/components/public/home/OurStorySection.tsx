import Container from "@/components/shared/Container";

const STORY_BADGE_URL =
  "https://ik.imagekit.io/Uespak/uespak/general/story-badge-removebg-preview.png";
const STORY_IMAGE_URL =
  "https://ik.imagekit.io/Uespak/uespak/general/story-img.png";

const HIGHLIGHTS = [
  "Engineering & Technical Services",
  "Industrial Automation Support",
  "Agriculture Solutions",
  "Facility Performance",
];

export default function OurStorySection() {
  return (
    <section className="relative overflow-hidden bg-white py-20 lg:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_85%_25%,rgba(7,95,63,0.07),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/3 hidden h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(7,95,63,0.08),transparent_70%)] lg:block"
      />

      <Container className="relative">
        {/* Top Row: heading (left) + badge banner (right) */}
        <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(280px,_420px)] md:gap-12 lg:gap-16">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3">
              <span className="h-px w-12 bg-[#075f3f]" />
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#075f3f]">
                Our Story
              </p>
            </div>
            <h2 className="text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-[#0f1f17] md:text-5xl xl:text-[3.25rem]">
              Engineering Excellence
              <br className="hidden md:block" />{" "}
              <span className="relative inline-block text-[#075f3f]">
                Across Every Sector
                <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-[#075f3f] via-[#0f7a54] to-transparent" />
              </span>
            </h2>
          </div>

          <div className="relative mx-auto w-full max-w-[420px] md:mx-0 md:ml-auto">
            <span
              aria-hidden
              className="absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(circle,rgba(7,95,63,0.10),transparent_70%)] blur-md"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={STORY_BADGE_URL}
              alt="UESPAK 30 years engineering excellence badge"
              className="relative mx-auto h-auto w-full max-w-[360px] object-contain drop-shadow-[0_18px_36px_rgba(7,95,63,0.20)] md:max-w-[400px] lg:max-w-[420px]"
              loading="lazy"
            />
          </div>
        </div>

        {/* Lower Row: image (left) + text (right) */}
        <div className="mt-8 grid items-center gap-10 sm:mt-10 lg:mt-12 lg:grid-cols-2 lg:gap-20">
          {/* Image block */}
          <div className="relative order-2 lg:order-1">
            {/* Decorative dot grid - top-left of image */}
            <span
              aria-hidden
              className="absolute -left-6 -top-8 hidden h-28 w-28 bg-[radial-gradient(circle,rgba(7,95,63,0.32)_1.2px,transparent_1.5px)] [background-size:14px_14px] sm:block"
            />
            {/* Decorative dot grid - bottom-right of image */}
            <span
              aria-hidden
              className="absolute -bottom-8 -right-6 hidden h-28 w-28 bg-[radial-gradient(circle,rgba(7,95,63,0.28)_1.2px,transparent_1.5px)] [background-size:14px_14px] sm:block"
            />

            {/* Top-left green corner block */}
            <span
              aria-hidden
              className="absolute -left-3 -top-3 z-10 hidden h-16 w-16 border-l-[6px] border-t-[6px] border-[#075f3f] sm:block lg:h-20 lg:w-20"
            />
            {/* Bottom-right green corner block */}
            <span
              aria-hidden
              className="absolute -bottom-3 -right-3 z-10 hidden h-16 w-16 border-b-[6px] border-r-[6px] border-[#075f3f] sm:block lg:h-20 lg:w-20"
            />

            <div className="relative overflow-hidden rounded-[1.5rem] bg-[#f5faf7] shadow-[0_28px_70px_rgba(2,33,23,0.22)] ring-1 ring-[#0a6d49]/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={STORY_IMAGE_URL}
                alt="UESPAK engineering and technical services story"
                className="aspect-[5/4] h-full w-full object-cover lg:aspect-[6/5]"
                loading="lazy"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(2,33,23,0.28)_100%)]"
              />
            </div>

            {/* Caption badge over image bottom-left */}
            <div className="absolute -bottom-6 left-4 z-20 max-w-[260px] rounded-2xl bg-white px-5 py-3.5 shadow-[0_22px_44px_rgba(2,33,23,0.20)] ring-1 ring-[#0a6d49]/10 sm:left-8">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e7f4ed] text-[#075f3f]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden
                  >
                    <path d="M12 2 4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#075f3f]">
                    Trusted Engineering Delivery
                  </p>
                  <p className="mt-0.5 text-[13px] font-semibold text-[#0f1f17]">
                    Engineering • Automation • Agriculture
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Text content */}
          <div className="order-1 space-y-6 lg:order-2">
            <h3 className="text-balance text-3xl font-bold leading-[1.15] tracking-tight text-[#0f1f17] md:text-[2.125rem] lg:text-[2.25rem]">
              Delivering Reliable Engineering, Automation &amp; Agriculture
              Solutions
            </h3>

            <div className="space-y-5 text-[15px] leading-[1.85] text-slate-600 md:text-base">
              <p>
                UESPAK is a professional engineering and technical services
                company delivering reliable solutions across engineering,
                HVAC-R, facility management, industrial automation, and
                agriculture-focused sectors.
              </p>
              <p>
                From commercial and industrial facilities to healthcare,
                pharmaceutical, infrastructure, and agriculture environments,
                UESPAK supports clients with dependable services designed to
                improve performance, efficiency, safety, and reliability.
              </p>
            </div>

            <ul className="grid gap-3 pt-2 sm:grid-cols-2">
              {HIGHLIGHTS.map((item) => (
                <li
                  key={item}
                  className="group flex items-center gap-3 rounded-xl bg-white px-3.5 py-2.5 ring-1 ring-[#0a6d49]/15 transition-all hover:-translate-y-0.5 hover:bg-[#f4faf6] hover:ring-[#0a6d49]/30"
                >
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#075f3f] text-white shadow-[0_6px_14px_rgba(7,95,63,0.28)]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3.5 w-3.5"
                      aria-hidden
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span className="text-sm font-semibold text-[#0f1f17]">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
