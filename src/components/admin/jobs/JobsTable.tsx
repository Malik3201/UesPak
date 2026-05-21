"use client";

import Link from "next/link";
import { Button } from "@/components/shared/Button";
import JobStatusBadge from "@/components/admin/jobs/JobStatusBadge";
import type { JobDto } from "@/types/job";
import { JOB_TYPE_LABELS } from "@/types/job";

interface JobsTableProps {
  jobs: JobDto[];
  onArchive: (id: string) => Promise<void>;
}

export default function JobsTable({ jobs, onArchive }: JobsTableProps) {
  if (!jobs.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        No jobs found. Create your first job opening to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-emerald-900/8 bg-white shadow-[0_8px_30px_rgba(7,95,63,0.06)]">
      <table className="w-full min-w-[960px] text-sm">
        <thead className="bg-[#f4f9f6] text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-4 py-3 font-semibold">Title</th>
            <th className="px-4 py-3 font-semibold">Department</th>
            <th className="px-4 py-3 font-semibold">Location</th>
            <th className="px-4 py-3 font-semibold">Type</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Featured</th>
            <th className="px-4 py-3 font-semibold">Updated</th>
            <th className="px-4 py-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id} className="border-t border-emerald-900/6 transition-colors hover:bg-[#f7fbf8]">
              <td className="px-4 py-3 font-medium text-foreground">{job.title}</td>
              <td className="px-4 py-3 text-muted-foreground">{job.department || "—"}</td>
              <td className="px-4 py-3 text-muted-foreground">{job.location || "—"}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {JOB_TYPE_LABELS[job.jobType]}
              </td>
              <td className="px-4 py-3">
                <JobStatusBadge status={job.status} />
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {job.isFeatured ? "Yes" : "No"}
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {job.updatedAt ? new Date(job.updatedAt).toLocaleString() : "—"}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {job.id ? (
                    <Link href={`/admin/jobs/${job.id}`}>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </Link>
                  ) : null}
                  {job.id ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => void onArchive(job.id!)}
                    >
                      Archive
                    </Button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
