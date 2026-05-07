"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import type { ProjectCategoryDto } from "@/types/project";
import { PROJECT_GROUPS } from "@/types/project";
import ProjectCategoriesTable from "@/components/admin/projects/ProjectCategoriesTable";

interface CategoriesResponse {
  categories: ProjectCategoryDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ProjectCategoriesPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoriesData, setCategoriesData] = useState<CategoriesResponse | null>(null);

  const page = Number(searchParams.get("page") || "1");
  const status = searchParams.get("status") || "";
  const search = searchParams.get("search") || "";
  const projectGroup = searchParams.get("projectGroup") || "";

  async function loadCategories() {
    try {
      const q = new URLSearchParams();
      if (status) q.set("status", status);
      if (search) q.set("search", search);
      if (projectGroup) q.set("projectGroup", projectGroup);
      q.set("page", String(page));
      q.set("limit", "20");
      const res = await fetch(`/api/admin/project-categories?${q.toString()}`, {
        credentials: "include",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        if (res.status === 401) {
          router.replace("/admin/login");
          return;
        }
        throw new Error(json?.message || "Failed to load project categories.");
      }
      setCategoriesData(json.data as CategoriesResponse);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load project categories."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleArchive(id: string) {
    if (!confirm("Archive this category?")) return;
    try {
      const res = await fetch(`/api/admin/project-categories/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to archive category.");
      }
      await loadCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Archive failed.");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, search, projectGroup]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Project Categories
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage category groups used in project filtering and classification.
          </p>
        </div>
        <Link href="/admin/project-categories/new">
          <Button>Add Category</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-card p-4">
        <Input
          className="min-w-[220px]"
          label="Search"
          placeholder="Name or slug"
          value={search}
          onChange={(e) => {
            const q = new URLSearchParams(searchParams.toString());
            if (e.target.value) q.set("search", e.target.value);
            else q.delete("search");
            q.set("page", "1");
            router.push(`/admin/project-categories?${q.toString()}`);
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
              router.push(`/admin/project-categories?${q.toString()}`);
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
              router.push(`/admin/project-categories?${q.toString()}`);
            }}
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </label>
      </div>

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Loading categories...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <>
          <ProjectCategoriesTable
            categories={categoriesData?.categories || []}
            onArchive={handleArchive}
          />
          {categoriesData?.pagination && categoriesData.pagination.totalPages > 1 ? (
            <div className="flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={categoriesData.pagination.page <= 1}
                onClick={() => {
                  const q = new URLSearchParams(searchParams.toString());
                  q.set("page", String(Math.max(1, categoriesData.pagination.page - 1)));
                  router.push(`/admin/project-categories?${q.toString()}`);
                }}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {categoriesData.pagination.page} of{" "}
                {categoriesData.pagination.totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={
                  categoriesData.pagination.page >= categoriesData.pagination.totalPages
                }
                onClick={() => {
                  const q = new URLSearchParams(searchParams.toString());
                  q.set("page", String(categoriesData.pagination.page + 1));
                  router.push(`/admin/project-categories?${q.toString()}`);
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

