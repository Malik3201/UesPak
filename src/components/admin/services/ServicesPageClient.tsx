"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import ServicesTable from "@/components/admin/services/ServicesTable";
import type { ServiceDto } from "@/types/service";
import { SERVICE_GROUPS } from "@/types/service";

interface ServicesResponse {
  services: ServiceDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ServicesPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [servicesData, setServicesData] = useState<ServicesResponse | null>(null);

  const page = Number(searchParams.get("page") || "1");
  const status = searchParams.get("status") || "";
  const search = searchParams.get("search") || "";
  const serviceGroup = searchParams.get("serviceGroup") || "";

  async function loadServices() {
    try {
      const q = new URLSearchParams();
      if (status) q.set("status", status);
      if (search) q.set("search", search);
      if (serviceGroup) q.set("serviceGroup", serviceGroup);
      q.set("page", String(page));
      q.set("limit", "20");
      const res = await fetch(`/api/admin/services?${q.toString()}`, {
        credentials: "include",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        if (res.status === 401) {
          router.replace("/admin/login");
          return;
        }
        throw new Error(json?.message || "Failed to load services.");
      }
      setServicesData(json.data as ServicesResponse);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load services.");
    } finally {
      setLoading(false);
    }
  }

  async function handleArchive(id: string) {
    if (!confirm("Archive this service?")) return;
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to archive service.");
      }
      await loadServices();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Archive failed.");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, search, serviceGroup]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Services</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage service content, status, media, and SEO.
          </p>
        </div>
        <Link href="/admin/services/new">
          <Button>Add Service</Button>
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
            router.push(`/admin/services?${q.toString()}`);
          }}
        />
        <label className="flex min-w-[220px] flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">Service Group</span>
          <select
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            value={serviceGroup}
            onChange={(e) => {
              const q = new URLSearchParams(searchParams.toString());
              if (e.target.value) q.set("serviceGroup", e.target.value);
              else q.delete("serviceGroup");
              q.set("page", "1");
              router.push(`/admin/services?${q.toString()}`);
            }}
          >
            <option value="">All groups</option>
            {SERVICE_GROUPS.map((g) => (
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
              router.push(`/admin/services?${q.toString()}`);
            }}
          >
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>
      </div>

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Loading services...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <>
          <ServicesTable
            services={servicesData?.services || []}
            onArchive={handleArchive}
          />
          {servicesData?.pagination && servicesData.pagination.totalPages > 1 ? (
            <div className="flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={servicesData.pagination.page <= 1}
                onClick={() => {
                  const q = new URLSearchParams(searchParams.toString());
                  q.set("page", String(Math.max(1, servicesData.pagination.page - 1)));
                  router.push(`/admin/services?${q.toString()}`);
                }}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {servicesData.pagination.page} of {servicesData.pagination.totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={servicesData.pagination.page >= servicesData.pagination.totalPages}
                onClick={() => {
                  const q = new URLSearchParams(searchParams.toString());
                  q.set("page", String(servicesData.pagination.page + 1));
                  router.push(`/admin/services?${q.toString()}`);
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
