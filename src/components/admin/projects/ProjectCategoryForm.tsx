"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/shared/Input";
import Textarea from "@/components/shared/Textarea";
import { Button } from "@/components/shared/Button";
import { generateSlug } from "@/lib/slug";
import type { ProjectCategoryDto, ProjectCategoryStatus, ProjectGroup } from "@/types/project";
import { PROJECT_GROUPS } from "@/types/project";

type FormMode = "create" | "edit";

const defaultCategory: Partial<ProjectCategoryDto> = {
  name: "",
  slug: "",
  description: "",
  order: 0,
  status: "active",
  projectGroup: "engineering",
  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: [],
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    robots: { index: true, follow: true },
    schemaType: "CollectionPage",
  },
};

export default function ProjectCategoryForm({
  mode,
  initialCategory,
}: {
  mode: FormMode;
  initialCategory?: Partial<ProjectCategoryDto>;
}) {
  const router = useRouter();
  const merged = useMemo(
    () => ({
      ...defaultCategory,
      ...initialCategory,
      seo: {
        ...defaultCategory.seo,
        ...initialCategory?.seo,
        robots: {
          index: initialCategory?.seo?.robots?.index ?? true,
          follow: initialCategory?.seo?.robots?.follow ?? true,
        },
      },
    }),
    [initialCategory]
  );

  const [form, setForm] = useState(merged);
  const [keywordsCsv, setKeywordsCsv] = useState(
    (initialCategory?.seo?.keywords ?? []).join(", ")
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateSlugFromName(name: string) {
    if (mode === "create" && (!form.slug || form.slug === generateSlug(form.name || ""))) {
      update("slug", generateSlug(name));
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const body = {
        ...form,
        seo: {
          ...form.seo,
          keywords: keywordsCsv
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
        },
      };

      const url =
        mode === "create"
          ? "/api/admin/project-categories"
          : `/api/admin/project-categories/${initialCategory?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to save project category.");
      }
      const category = json?.data?.category;
      setMessage(
        mode === "create"
          ? "Project category created successfully."
          : "Project category saved successfully."
      );
      if (mode === "create" && category?.id) {
        router.replace(`/admin/project-categories/${category.id}`);
      } else {
        update("slug", category?.slug || form.slug);
        router.refresh();
      }
    } catch (errObj) {
      setError(errObj instanceof Error ? errObj.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 pb-20">
      {message ? (
        <div className="rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">Basic Info</h2>
        <Input
          label="Name"
          required
          value={form.name || ""}
          onChange={(e) => {
            const name = e.target.value;
            update("name", name);
            updateSlugFromName(name);
          }}
        />
        <Input
          label="Slug"
          value={form.slug || ""}
          onChange={(e) => update("slug", generateSlug(e.target.value))}
          hint="URL-safe lowercase slug."
        />
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">Project Group</span>
          <select
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            value={(form.projectGroup as ProjectGroup | undefined) || "engineering"}
            onChange={(e) => update("projectGroup", e.target.value as ProjectGroup)}
          >
            {PROJECT_GROUPS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </label>
        <Textarea
          label="Description"
          rows={3}
          value={form.description || ""}
          onChange={(e) => update("description", e.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Order"
            type="number"
            value={String(form.order ?? 0)}
            onChange={(e) => update("order", Number(e.target.value || 0))}
          />
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-foreground">Status</span>
            <select
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
              value={(form.status as ProjectCategoryStatus | undefined) || "active"}
              onChange={(e) => update("status", e.target.value as ProjectCategoryStatus)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">SEO</h2>
        <Input
          label="Meta title"
          value={form.seo?.metaTitle || ""}
          onChange={(e) => update("seo", { ...(form.seo ?? {}), metaTitle: e.target.value })}
        />
        <Textarea
          label="Meta description"
          rows={3}
          value={form.seo?.metaDescription || ""}
          onChange={(e) =>
            update("seo", { ...(form.seo ?? {}), metaDescription: e.target.value })
          }
        />
        <Textarea
          label="Keywords CSV"
          rows={2}
          value={keywordsCsv}
          onChange={(e) => setKeywordsCsv(e.target.value)}
        />
      </section>

      <div className="sticky bottom-0 z-20 border-t border-border bg-background/95 py-4 backdrop-blur">
        <Button type="submit" isLoading={saving} disabled={saving}>
          {mode === "create" ? "Create Category" : "Save Category"}
        </Button>
      </div>
    </form>
  );
}

