"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import TeamMembersTable from "@/components/admin/team/TeamMembersTable";
import type { TeamMemberDto } from "@/types/team";

interface TeamMembersResponse {
  teamMembers: TeamMemberDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function TeamMembersPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TeamMembersResponse | null>(null);

  const page = Number(searchParams.get("page") || "1");
  const status = searchParams.get("status") || "";
  const search = searchParams.get("search") || "";
  const featured = searchParams.get("featured") || "";
  const department = searchParams.get("department") || "";

  const loadMembers = useCallback(async () => {
    try {
      const q = new URLSearchParams();
      if (status) q.set("status", status);
      if (search) q.set("search", search);
      if (featured) q.set("featured", featured);
      if (department) q.set("department", department);
      q.set("page", String(page));
      q.set("limit", "20");
      const res = await fetch(`/api/admin/team?${q.toString()}`, {
        credentials: "include",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        if (res.status === 401) {
          router.replace("/admin/login");
          return;
        }
        throw new Error(json?.message || "Failed to load team members.");
      }
      setData(json.data as TeamMembersResponse);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load team.");
    } finally {
      setLoading(false);
    }
  }, [page, status, search, featured, department, router]);

  async function handleArchive(id: string) {
    if (!confirm("Archive this team member?")) return;
    try {
      const res = await fetch(`/api/admin/team/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to archive team member.");
      }
      await loadMembers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Archive failed.");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadMembers();
  }, [loadMembers]);

  function pushQuery(updater: (q: URLSearchParams) => void) {
    const q = new URLSearchParams(searchParams.toString());
    updater(q);
    q.set("page", "1");
    router.push(`/admin/team?${q.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Team Members
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage profiles, photos, departments, featured flag, and SEO.
          </p>
        </div>
        <Link href="/admin/team/new">
          <Button>Add Team Member</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-card p-4">
        <Input
          className="min-w-[220px]"
          label="Search"
          placeholder="Name, designation, department, or slug"
          value={search}
          onChange={(e) =>
            pushQuery((q) => {
              if (e.target.value) q.set("search", e.target.value);
              else q.delete("search");
            })
          }
        />
        <Input
          className="min-w-[180px]"
          label="Department"
          placeholder="Filter by department"
          value={department}
          onChange={(e) =>
            pushQuery((q) => {
              if (e.target.value) q.set("department", e.target.value);
              else q.delete("department");
            })
          }
        />
        <label className="flex min-w-[160px] flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">Status</span>
          <select
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            value={status}
            onChange={(e) =>
              pushQuery((q) => {
                if (e.target.value) q.set("status", e.target.value);
                else q.delete("status");
              })
            }
          >
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label className="flex min-w-[160px] flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">Featured</span>
          <select
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            value={featured}
            onChange={(e) =>
              pushQuery((q) => {
                if (e.target.value) q.set("featured", e.target.value);
                else q.delete("featured");
              })
            }
          >
            <option value="">All</option>
            <option value="true">Featured</option>
            <option value="false">Not Featured</option>
          </select>
        </label>
      </div>

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Loading team members...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <>
          <TeamMembersTable
            members={data?.teamMembers || []}
            onArchive={handleArchive}
          />
          {data?.pagination && data.pagination.totalPages > 1 ? (
            <div className="flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={data.pagination.page <= 1}
                onClick={() => {
                  const q = new URLSearchParams(searchParams.toString());
                  q.set("page", String(Math.max(1, data.pagination.page - 1)));
                  router.push(`/admin/team?${q.toString()}`);
                }}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={
                  data.pagination.page >= data.pagination.totalPages
                }
                onClick={() => {
                  const q = new URLSearchParams(searchParams.toString());
                  q.set("page", String(data.pagination.page + 1));
                  router.push(`/admin/team?${q.toString()}`);
                }}
              >
                Next
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
