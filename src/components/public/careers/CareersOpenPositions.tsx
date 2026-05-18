import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Container from "@/components/shared/Container";
import JobCard from "@/components/public/careers/JobCard";
import { toJobCardData } from "@/lib/jobs";
import type { IJob } from "@/models/Job";

interface CareersOpenPositionsProps {
  jobs: IJob[];
  careersEmail?: string;
}

export default function CareersOpenPositions({
  jobs,
  careersEmail,
}: CareersOpenPositionsProps) {
  const cards = jobs.map((j) => toJobCardData(j as IJob & { _id: unknown }));
  const profileMailto = careersEmail
    ? `mailto:${encodeURIComponent(careersEmail)}?subject=${encodeURIComponent("Career inquiry – UESPAK")}`
    : "/contact-us";

  return (
    <section className="homepage-section-reveal w-full bg-[linear-gradient(180deg,#f7fbf8_0%,#ffffff_100%)] py-16 md:py-20 lg:py-24">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#075f3f]">
            Open Positions
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0f172a] md:text-4xl">
            Join our growing team
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Explore current opportunities across engineering, technical delivery, and
            operations at UESPAK.
          </p>
        </div>

        {cards.length ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="mx-auto mt-12 max-w-xl rounded-3xl border border-dashed border-emerald-900/15 bg-white p-10 text-center shadow-sm">
            <p className="text-base leading-relaxed text-slate-600">
              There are currently no open positions. You can still share your profile with
              us for future opportunities.
            </p>
            <Link
              href={profileMailto}
              className="group mt-6 inline-flex items-center gap-2 rounded-full bg-[#075f3f] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#03452e]"
            >
              Send Your Profile
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        )}
      </Container>
    </section>
  );
}
