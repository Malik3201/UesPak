import Link from "next/link";
import { ArrowLeft, ArrowRight, Briefcase, Calendar, MapPin } from "lucide-react";
import Container from "@/components/shared/Container";
import DetailHero from "@/components/public/catalog/DetailHero";
import type { IJob } from "@/models/Job";
import {
  JOB_EXPERIENCE_LABELS,
  JOB_TYPE_LABELS,
  JOB_WORK_MODE_LABELS,
} from "@/types/job";

interface JobDetailViewProps {
  job: IJob;
}

function applyHref(job: IJob): { href: string; external: boolean } {
  if (job.applyUrl?.trim()) {
    return { href: job.applyUrl.trim(), external: true };
  }
  if (job.applyEmail?.trim()) {
    return {
      href: `mailto:${encodeURIComponent(job.applyEmail.trim())}?subject=${encodeURIComponent(`Application: ${job.title}`)}`,
      external: false,
    };
  }
  return { href: "/contact-us", external: false };
}

function ListSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  const list = items.filter(Boolean);
  if (!list.length) return null;
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#075f3f]">
        {title}
      </h2>
      <ul className="mt-4 space-y-2.5">
        {list.map((item, idx) => (
          <li
            key={`${title}-${idx}`}
            className="flex gap-3 text-base leading-relaxed text-slate-700"
          >
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#075f3f]" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function JobDetailView({ job }: JobDetailViewProps) {
  const apply = applyHref(job);
  const deadline = job.deadline ? new Date(job.deadline) : null;
  const chips = [
    job.department ? { label: "Department", value: job.department } : null,
    job.location ? { label: "Location", value: job.location } : null,
    { label: "Type", value: JOB_TYPE_LABELS[job.jobType] },
    { label: "Mode", value: JOB_WORK_MODE_LABELS[job.workMode] },
    {
      label: "Experience",
      value: job.experienceRequired?.trim() || JOB_EXPERIENCE_LABELS[job.experienceLevel],
    },
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <>
      <DetailHero
        title={job.title}
        excerpt={job.shortDescription}
        badge={job.department || "Open Position"}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Careers", href: "/careers" },
          { label: job.title },
        ]}
        metaChips={chips}
      />

      <section className="w-full bg-[#f7fbf8] py-12 md:py-16 lg:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start lg:gap-12 xl:grid-cols-[1fr_360px]">
            <div className="min-w-0 space-y-10">
              {(job.shortDescription || job.description) && (
                <section>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#075f3f]">
                    Overview
                  </h2>
                  {job.shortDescription ? (
                    <p className="mt-4 text-base leading-relaxed text-slate-700 md:text-lg">
                      {job.shortDescription}
                    </p>
                  ) : null}
                  {job.description ? (
                    <article
                      className="prose prose-neutral mt-4 max-w-none prose-headings:text-[#0f172a] prose-a:text-[#075f3f]"
                      dangerouslySetInnerHTML={{ __html: job.description }}
                    />
                  ) : null}
                </section>
              )}

              <ListSection title="Responsibilities" items={job.responsibilities || []} />
              <ListSection title="Requirements" items={job.requirements || []} />
              <ListSection title="Benefits" items={job.benefits || []} />

              {(job.skills || []).filter(Boolean).length ? (
                <section>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#075f3f]">
                    Skills
                  </h2>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {(job.skills || []).filter(Boolean).map((skill) => (
                      <li
                        key={skill}
                        className="rounded-full border border-emerald-900/10 bg-white px-3 py-1.5 text-sm font-medium text-[#075f3f]"
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {job.applicationInstructions?.trim() ? (
                <section>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#075f3f]">
                    Application Instructions
                  </h2>
                  <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-slate-700">
                    {job.applicationInstructions}
                  </p>
                </section>
              ) : null}
            </div>

            <aside className="lg:sticky lg:top-24">
              <div className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-[0_16px_40px_rgba(7,95,63,0.1)]">
                <h2 className="text-lg font-bold text-[#0f172a]">Job Summary</h2>
                <dl className="mt-5 space-y-4 text-sm">
                  {job.department ? (
                    <div>
                      <dt className="flex items-center gap-1.5 font-semibold text-[#075f3f]">
                        <Briefcase className="h-4 w-4" aria-hidden />
                        Department
                      </dt>
                      <dd className="mt-1 text-slate-700">{job.department}</dd>
                    </div>
                  ) : null}
                  {job.location ? (
                    <div>
                      <dt className="flex items-center gap-1.5 font-semibold text-[#075f3f]">
                        <MapPin className="h-4 w-4" aria-hidden />
                        Location
                      </dt>
                      <dd className="mt-1 text-slate-700">{job.location}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt className="font-semibold text-[#075f3f]">Job Type</dt>
                    <dd className="mt-1 text-slate-700">{JOB_TYPE_LABELS[job.jobType]}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#075f3f]">Work Mode</dt>
                    <dd className="mt-1 text-slate-700">{JOB_WORK_MODE_LABELS[job.workMode]}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#075f3f]">Experience</dt>
                    <dd className="mt-1 text-slate-700">
                      {job.experienceRequired?.trim() ||
                        JOB_EXPERIENCE_LABELS[job.experienceLevel]}
                    </dd>
                  </div>
                  {deadline ? (
                    <div>
                      <dt className="flex items-center gap-1.5 font-semibold text-[#075f3f]">
                        <Calendar className="h-4 w-4" aria-hidden />
                        Deadline
                      </dt>
                      <dd className="mt-1 text-slate-700">
                        {deadline.toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </dd>
                    </div>
                  ) : null}
                </dl>

                {apply.external ? (
                  <a
                    href={apply.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#075f3f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#03452e]"
                  >
                    Apply Now
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </a>
                ) : (
                  <Link
                    href={apply.href}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#075f3f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#03452e]"
                  >
                    Apply Now
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                )}

                <Link
                  href="/careers"
                  className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-[#075f3f] transition hover:text-[#03452e]"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  Back to Careers
                </Link>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
