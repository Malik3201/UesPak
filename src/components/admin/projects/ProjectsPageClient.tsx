"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import type { ProjectDto, ProjectCategoryDto } from "@/types/project";
import { PROJECT_GROUPS } from "@/types/project";
import ProjectsTable from "@/components/admin/projects/ProjectsTable";

interface ProjectsResponse {
  projects: ProjectDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ProjectsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectsData, setProjectsData] = useState<ProjectsResponse | null>(null);
  const [categories, setCategories] = useState<ProjectCategoryDto[]>([]);

  const page = Number(searchParams.get("page") || "1");
  const status = searchParams.get("status") || "";
  const search = searchParams.get("search") || "";
  const projectGroup = searchParams.get("projectGroup") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const featured = searchParams.get("featured") || "";

  async function loadProjects() {
    try {
      const q = new URLSearchParams();
      if (status) q.set("status", status);
      if (search) q.set("search", search);
      if (projectGroup) q.set("projectGroup", projectGroup);
      if (categoryId) q.set("categoryId", categoryId);
      if (featured) q.set("featured", featured);
      q.set("page", String(page));
      q.set("limit", "20");

      const [projectsRes, categoriesRes] = await Promise.all([
        fetch(`/api/admin/projects?${q.toString()}`, { credentials: "include" }),
        fetch("/api/admin/project-categories?status=active&limit=200", {
          credentials: "include",
        }),
      ]);
      const projectsJson = await projectsRes.json().catch(() => null);
      const categoriesJson = await categoriesRes.json().catch(() => null);

      if (!projectsRes.ok || !projectsJson?.success) {
        if (projectsRes.status === 401) {
          router.replace("/admin/login");
          return;
        }
        throw new Error(projectsJson?.message || "Failed to load projects.");
      }

      setProjectsData(projectsJson.data as ProjectsResponse);
      setCategories((categoriesJson?.data?.categories as ProjectCategoryDto[]) || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load projects.");
    } finally {
      setLoading(false);
    }
  }

  async function handleArchive(id: string) {
    if (!confirm("Archive this project?")) return;
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to archive project.");
      }
      await loadProjects();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Archive failed.");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, search, projectGroup, categoryId, featured]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage engineering, agriculture, and industrial automation projects.
          </p>
        </div>
        <Link href="/admin/projects/new">
          <Button>Add Project</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-card p-4">
        <Input
          className="min-w-[220px]"
          label="Search"
          placeholder="Title, excerpt, or slug"
          value={search}
          onChange={(e) => {
            const q = new URLSearchParams(searchParams.toString());
            if (e.target.value) q.set("search", e.target.value);
            else q.delete("search");
            q.set("page", "1");
            router.push(`/admin/projects?${q.toString()}`);
          }}
        />
        <label className="flex min-w-[220px] flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">Project Group</span>
          <select
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            value={projectGroup}
            onChange={(e) => {
              const q = new URLSearchParams(searchParams.toString());
              if (e.target.value) q.set("projectGroup", e.target.value);
              else q.delete("projectGroup");
              q.set("page", "1");
              router.push(`/admin/projects?${q.toString()}`);
            }}
          >
            <option value="">All groups</option>
            {PROJECT_GROUPS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-[180px] flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">Status</span>
          <select
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            value={status}
            onChange={(e) => {
              const q = new URLSearchParams(searchParams.toString());
              if (e.target.value) q.set("status", e.target.value);
              else q.delete("status");
              q.set("page", "1");
              router.push(`/admin/projects?${q.toString()}`);
            }}
          >
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label className="flex min-w-[220px] flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">Category</span>
          <select
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            value={categoryId}
            onChange={(e) => {
              const q = new URLSearchParams(searchParams.toString());
              if (e.target.value) q.set("categoryId", e.target.value);
              else q.delete("categoryId");
              q.set("page", "1");
              router.push(`/admin/projects?${q.toString()}`);
            }}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-[150px] flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">Featured</span>
          <select
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            value={featured}
            onChange={(e) => {
              const q = new URLSearchParams(searchParams.toString());
              if (e.target.value) q.set("featured", e.target.value);
              else q.delete("featured");
              q.set("page", "1");
              router.push(`/admin/projects?${q.toString()}`);
            }}
          >
            <option value="">All</option>
            <option value="true">Featured</option>
            <option value="false">Not featured</option>
          </select>
        </label>
      </div>

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Loading projects...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <>
          <ProjectsTable projects={projectsData?.projects || []} onArchive={handleArchive} />
          {projectsData?.pagination && projectsData.pagination.totalPages > 1 ? (
            <div className="flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={projectsData.pagination.page <= 1}
                onClick={() => {
                  const q = new URLSearchParams(searchParams.toString());
                  q.set("page", String(Math.max(1, projectsData.pagination.page - 1)));
                  router.push(`/admin/projects?${q.toString()}`);
                }}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {projectsData.pagination.page} of {projectsData.pagination.totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={projectsData.pagination.page >= projectsData.pagination.totalPages}
                onClick={() => {
                  const q = new URLSearchParams(searchParams.toString());
                  q.set("page", String(projectsData.pagination.page + 1));
                  router.push(`/admin/projects?${q.toString()}`);
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

