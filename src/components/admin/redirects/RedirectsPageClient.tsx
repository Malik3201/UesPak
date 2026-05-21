"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import RedirectsTable from "@/components/admin/redirects/RedirectsTable";
import type { RedirectDto } from "@/types/redirect";

interface RedirectsResponse {
  redirects: RedirectDto[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export default function RedirectsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RedirectsResponse | null>(null);

  const page = Number(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const activeFilter = searchParams.get("isActive") || "";

  async function loadRedirects() {
    try {
      const q = new URLSearchParams();
      if (search) q.set("search", search);
      if (activeFilter) q.set("isActive", activeFilter);
      q.set("page", String(page));
      q.set("limit", "20");
      const res = await fetch(`/api/admin/redirects?${q.toString()}`, {
        credentials: "include",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        if (res.status === 401) {
          router.replace("/admin/login");
          return;
        }
        throw new Error(json?.message || "Failed to load redirects.");
      }
      setData(json.data as RedirectsResponse);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load redirects.");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    try {
      const res = await fetch(`/api/admin/redirects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to update redirect.");
      }
      await loadRedirects();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this redirect permanently?")) return;
    try {
      const res = await fetch(`/api/admin/redirects/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to delete redirect.");
      }
      await loadRedirects();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed.");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRedirects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, activeFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Redirects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Map old URLs to new destinations (301/302/307/308).
          </p>
        </div>
        <Link href="/admin/redirects/new">
          <Button>Add Redirect</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-card p-4">
        <Input
          label="Search"
          placeholder="From or to path..."
          defaultValue={search}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const v = (e.target as HTMLInputElement).value;
              const q = new URLSearchParams(searchParams.toString());
              if (v) q.set("search", v);
              else q.delete("search");
              q.set("page", "1");
              router.push(`/admin/redirects?${q.toString()}`);
            }
          }}
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Active</label>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={activeFilter}
            onChange={(e) => {
              const q = new URLSearchParams(searchParams.toString());
              if (e.target.value) q.set("isActive", e.target.value);
              else q.delete("isActive");
              q.set("page", "1");
              router.push(`/admin/redirects?${q.toString()}`);
            }}
          >
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : loading ? (
        <p className="text-sm text-muted-foreground">Loading redirects...</p>
      ) : (
        <RedirectsTable
          redirects={data?.redirects ?? []}
          onToggleActive={handleToggleActive}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
