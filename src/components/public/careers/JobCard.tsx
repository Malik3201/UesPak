import Link from "next/link";
import { ArrowRight, MapPin, Briefcase } from "lucide-react";
import type { JobCardData } from "@/types/job";
import {
  JOB_EXPERIENCE_LABELS,
  JOB_TYPE_LABELS,
  JOB_WORK_MODE_LABELS,
} from "@/types/job";

interface JobCardProps {
  job: JobCardData;
}

function applyHref(job: JobCardData): string | null {
  if (job.applyUrl?.trim()) return job.applyUrl.trim();
  if (job.applyEmail?.trim()) {
    return `mailto:${encodeURIComponent(job.applyEmail.trim())}?subject=${encodeURIComponent(`Application: ${job.title}`)}`;
  }
  return null;
}

export default function JobCard({ job }: JobCardProps) {
  const apply = applyHref(job);

  return (
    <article className="homepage-card-rise group flex h-full flex-col rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-[0_14px_36px_rgba(7,95,63,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300/40 hover:shadow-[0_22px_48px_rgba(7,95,63,0.14)]">
      {job.isFeatured ? (
        <span className="mb-3 inline-flex w-fit rounded-full bg-[#075f3f] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          Featured
        </span>
      ) : null}
      <h3 className="text-lg font-bold leading-snug text-[#0f172a]">{job.title}</h3>
      {job.shortDescription ? (
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
          {job.shortDescription}
        </p>
      ) : null}
      <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
        {job.department ? (
          <li className="flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-[#075f3f]" aria-hidden />
            {job.department}
          </li>
        ) : null}
        {job.location ? (
          <li className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-[#075f3f]" aria-hidden />
            {job.location}
          </li>
        ) : null}
        <li>
          {JOB_TYPE_LABELS[job.jobType]} · {JOB_WORK_MODE_LABELS[job.workMode]} ·{" "}
          {JOB_EXPERIENCE_LABELS[job.experienceLevel]}
        </li>
      </ul>
      <div className="mt-auto flex flex-wrap gap-2 pt-6">
        <Link
          href={`/careers/${job.slug}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#075f3f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#03452e]"
        >
          View Details
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        {apply ? (
          <a
            href={apply}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#075f3f] px-4 py-2 text-sm font-semibold text-[#075f3f] transition hover:bg-[#edf7f1]"
          >
            Apply Now
          </a>
        ) : null}
      </div>
    </article>
  );
}
