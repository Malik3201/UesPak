"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import JobsTable from "@/components/admin/jobs/JobsTable";
import type { JobDto } from "@/types/job";

interface JobsResponse {
  jobs: JobDto[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export default function JobsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobsData, setJobsData] = useState<JobsResponse | null>(null);

  const page = Number(searchParams.get("page") || "1");
  const status = searchParams.get("status") || "";
  const search = searchParams.get("search") || "";
  const department = searchParams.get("department") || "";

  async function loadJobs() {
    try {
      const q = new URLSearchParams();
      if (status) q.set("status", status);
      if (search) q.set("search", search);
      if (department) q.set("department", department);
      q.set("page", String(page));
      q.set("limit", "20");
      const res = await fetch(`/api/admin/jobs?${q.toString()}`, {
        credentials: "include",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        if (res.status === 401) {
          router.replace("/admin/login");
          return;
        }
        throw new Error(json?.message || "Failed to load jobs.");
      }
      setJobsData(json.data as JobsResponse);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load jobs.");
    } finally {
      setLoading(false);
    }
  }

  async function handleArchive(id: string) {
    if (!confirm("Archive this job opening?")) return;
    try {
      const res = await fetch(`/api/admin/jobs/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to archive job.");
      }
      await loadJobs();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Archive failed.");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, search, department]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Jobs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage job openings shown on the public careers page.
          </p>
        </div>
        <Link href="/admin/jobs/new">
          <Button>Add Job</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-card p-4">
        <Input
          label="Search"
          placeholder="Title, department, location..."
          defaultValue={search}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const v = (e.target as HTMLInputElement).value;
              const q = new URLSearchParams(searchParams.toString());
              if (v) q.set("search", v);
              else q.delete("search");
              q.set("page", "1");
              router.push(`/admin/jobs?${q.toString()}`);
            }
          }}
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Status</label>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={status}
            onChange={(e) => {
              const q = new URLSearchParams(searchParams.toString());
              if (e.target.value) q.set("status", e.target.value);
              else q.delete("status");
              q.set("page", "1");
              router.push(`/admin/jobs?${q.toString()}`);
            }}
          >
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <Input
          label="Department"
          placeholder="Filter department"
          defaultValue={department}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const v = (e.target as HTMLInputElement).value;
              const q = new URLSearchParams(searchParams.toString());
              if (v) q.set("department", v);
              else q.delete("department");
              q.set("page", "1");
              router.push(`/admin/jobs?${q.toString()}`);
            }
          }}
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : loading ? (
        <p className="text-sm text-muted-foreground">Loading jobs...</p>
      ) : (
        <JobsTable jobs={jobsData?.jobs ?? []} onArchive={handleArchive} />
      )}
    </div>
  );
}
