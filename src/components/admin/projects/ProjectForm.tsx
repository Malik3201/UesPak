"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { MediaObject } from "@/types/media";
import type { ProjectCategoryDto, ProjectDto, ProjectGroup, ProjectStatus } from "@/types/project";
import { PROJECT_GROUPS } from "@/types/project";
import { Input } from "@/components/shared/Input";
import Textarea from "@/components/shared/Textarea";
import { Button } from "@/components/shared/Button";
import AdminMediaUploader from "@/components/admin/media/AdminMediaUploader";
import { MEDIA_UPLOAD_FOLDERS } from "@/constants/media-folders";
import { generateSlug } from "@/lib/slug";

type FormMode = "create" | "edit";

const defaultProject: Partial<ProjectDto> = {
  title: "",
  slug: "",
  projectGroup: "engineering",
  categoryIds: [],
  categoriesSnapshot: [],
  excerpt: "",
  description: "",
  content: "",
  status: "draft",
  order: 0,
  isFeatured: false,
  site: "",
  client: "",
  location: "",
  discipline: "",
  servicesProvided: [],
  scope: "",
  scopeItems: [],
  technologies: [],
  outcomes: [],
  gallery: [],
  linkedServices: [],
  cta: {
    isActive: false,
    title: "",
    description: "",
    buttonText: "",
    buttonUrl: "",
  },
  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: [],
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    robots: { index: true, follow: true },
    schemaType: "CreativeWork",
  },
};

interface ServiceOpt {
  id: string;
  title: string;
}

export default function ProjectForm({
  mode,
  initialProject,
}: {
  mode: FormMode;
  initialProject?: Partial<ProjectDto>;
}) {
  const router = useRouter();
  const merged = useMemo(
    () => ({
      ...defaultProject,
      ...initialProject,
      categoryIds: initialProject?.categoryIds ?? [],
      linkedServices: initialProject?.linkedServices ?? [],
      gallery: initialProject?.gallery ?? [],
      servicesProvided: initialProject?.servicesProvided ?? [],
      scopeItems: initialProject?.scopeItems ?? [],
      technologies: initialProject?.technologies ?? [],
      outcomes: initialProject?.outcomes ?? [],
      cta: { ...defaultProject.cta, ...initialProject?.cta },
      seo: {
        ...defaultProject.seo,
        ...initialProject?.seo,
        robots: {
          index: initialProject?.seo?.robots?.index ?? true,
          follow: initialProject?.seo?.robots?.follow ?? true,
        },
      },
    }),
    [initialProject]
  );

  const [form, setForm] = useState(merged);
  const [categories, setCategories] = useState<ProjectCategoryDto[]>([]);
  const [serviceOptions, setServiceOptions] = useState<ServiceOpt[]>([]);
  const [keywordsCsv, setKeywordsCsv] = useState((initialProject?.seo?.keywords ?? []).join(", "));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const [catsRes, servicesRes] = await Promise.all([
        fetch("/api/admin/project-categories?status=active&limit=300", {
          credentials: "include",
        }),
        fetch("/api/admin/services?limit=300", { credentials: "include" }),
      ]);
      const catsJson = await catsRes.json().catch(() => null);
      const servicesJson = await servicesRes.json().catch(() => null);
      setCategories((catsJson?.data?.categories as ProjectCategoryDto[]) || []);
      const services = (servicesJson?.data?.services as Array<{ id: string; title: string }>) || [];
      setServiceOptions(services.map((s) => ({ id: s.id, title: s.title })));
    })();
  }, []);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateSlugFromTitle(title: string) {
    if (mode === "create" && (!form.slug || form.slug === generateSlug(form.title || ""))) {
      update("slug", generateSlug(title));
    }
  }

  function addStringItem(
    key: "servicesProvided" | "scopeItems" | "technologies" | "outcomes"
  ) {
    update(key, [...(form[key] ?? []), ""]);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    const selectedCategoryMap = new Map(categories.map((c) => [c.id, c]));

    try {
      const body = {
        ...form,
        categoriesSnapshot: (form.categoryIds ?? [])
          .map((id) => selectedCategoryMap.get(id))
          .filter(Boolean)
          .map((c) => ({ id: c!.id, name: c!.name, slug: c!.slug })),
        seo: {
          ...form.seo,
          keywords: keywordsCsv
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
        },
      };

      const url = mode === "create" ? "/api/admin/projects" : `/api/admin/projects/${initialProject?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to save project.");
      }
      const project = json?.data?.project;
      setMessage(mode === "create" ? "Project created successfully." : "Project saved successfully.");
      if (mode === "create" && project?.id) {
        router.replace(`/admin/projects/${project.id}`);
      } else {
        update("slug", project?.slug || form.slug);
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
      {message ? <div className="rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">{message}</div> : null}
      {error ? <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">Basic Info</h2>
        <Input
          label="Title"
          required
          value={form.title || ""}
          onChange={(e) => {
            const title = e.target.value;
            update("title", title);
            updateSlugFromTitle(title);
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
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">Categories</span>
          <select
            multiple
            className="min-h-28 rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={form.categoryIds || []}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions).map((o) => o.value);
              update("categoryIds", values);
            }}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <Textarea label="Excerpt" rows={3} value={form.excerpt || ""} onChange={(e) => update("excerpt", e.target.value)} />
        <Textarea label="Description" rows={3} value={form.description || ""} onChange={(e) => update("description", e.target.value)} />
        <Textarea label="Content" rows={8} value={form.content || ""} onChange={(e) => update("content", e.target.value)} />
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-foreground">Status</span>
            <select
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
              value={(form.status as ProjectStatus | undefined) || "draft"}
              onChange={(e) => update("status", e.target.value as ProjectStatus)}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <Input label="Order" type="number" value={String(form.order ?? 0)} onChange={(e) => update("order", Number(e.target.value || 0))} />
          <label className="flex items-center gap-2 pt-7 text-sm text-muted-foreground">
            <input type="checkbox" checked={Boolean(form.isFeatured)} onChange={(e) => update("isFeatured", e.target.checked)} />
            Featured project
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">Project Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Site" value={form.site || ""} onChange={(e) => update("site", e.target.value)} />
          <Input label="Client" value={form.client || ""} onChange={(e) => update("client", e.target.value)} />
          <Input label="Location" value={form.location || ""} onChange={(e) => update("location", e.target.value)} />
          <Input label="Engineering Discipline" value={form.discipline || ""} onChange={(e) => update("discipline", e.target.value)} />
          <Input label="Commissioning Date" type="date" value={form.commissioningDate ? new Date(form.commissioningDate).toISOString().slice(0, 10) : ""} onChange={(e) => update("commissioningDate", e.target.value)} />
        </div>

        {(["servicesProvided", "scopeItems", "technologies", "outcomes"] as const).map((key) => (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold capitalize">{key.replace(/([A-Z])/g, " $1")}</h3>
              <Button type="button" size="sm" variant="outline" onClick={() => addStringItem(key)}>
                Add item
              </Button>
            </div>
            {(form[key] ?? []).map((item, idx) => (
              <div key={`${key}-${idx}`} className="flex items-center gap-2">
                <Input
                  className="flex-1"
                  value={item}
                  onChange={(e) => {
                    const copy = [...(form[key] ?? [])];
                    copy[idx] = e.target.value;
                    update(key, copy);
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const copy = [...(form[key] ?? [])];
                    copy.splice(idx, 1);
                    update(key, copy);
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        ))}

        <Textarea label="Scope" rows={4} value={form.scope || ""} onChange={(e) => update("scope", e.target.value)} />
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">Linked Services</h2>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">Select Services</span>
          <select
            multiple
            className="min-h-28 rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={form.linkedServices || []}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions).map((o) => o.value);
              update("linkedServices", values);
            }}
          >
            {serviceOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">Media</h2>
        <AdminMediaUploader
          label="Featured image"
          value={form.featuredImage}
          folder={MEDIA_UPLOAD_FOLDERS.projects}
          usage="project-featured"
          mediaType="image"
          onChange={(asset) => update("featuredImage", asset as MediaObject)}
        />
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Gallery</h3>
          <AdminMediaUploader
            label="Add gallery image"
            folder={MEDIA_UPLOAD_FOLDERS.projects}
            usage="project-gallery"
            mediaType="image"
            onChange={(asset) => {
              if (!asset) return;
              update("gallery", [...(form.gallery ?? []), asset]);
            }}
          />
          {(form.gallery ?? []).length ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {(form.gallery ?? []).map((img, idx) => (
                <div key={`${img.publicId}-${idx}`} className="rounded-md border border-border p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.altText || "Gallery image"} className="h-24 w-full rounded object-cover" />
                  <Input
                    className="mt-2"
                    placeholder="Alt text"
                    value={img.altText || ""}
                    onChange={(e) => {
                      const copy = [...(form.gallery ?? [])];
                      copy[idx] = { ...copy[idx], altText: e.target.value };
                      update("gallery", copy);
                    }}
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => {
                    const copy = [...(form.gallery ?? [])];
                    copy.splice(idx, 1);
                    update("gallery", copy);
                  }}>Remove</Button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">CTA</h2>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={Boolean(form.cta?.isActive)} onChange={(e) => update("cta", { ...(form.cta ?? { isActive: false }), isActive: e.target.checked })} />
          CTA enabled
        </label>
        <Input label="CTA title" value={form.cta?.title || ""} onChange={(e) => update("cta", { ...(form.cta ?? { isActive: false }), title: e.target.value })} />
        <Textarea label="CTA description" rows={3} value={form.cta?.description || ""} onChange={(e) => update("cta", { ...(form.cta ?? { isActive: false }), description: e.target.value })} />
        <Input label="CTA button text" value={form.cta?.buttonText || ""} onChange={(e) => update("cta", { ...(form.cta ?? { isActive: false }), buttonText: e.target.value })} />
        <Input label="CTA button URL" value={form.cta?.buttonUrl || ""} onChange={(e) => update("cta", { ...(form.cta ?? { isActive: false }), buttonUrl: e.target.value })} />
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">SEO</h2>
        <Input label="Meta title" value={form.seo?.metaTitle || ""} onChange={(e) => update("seo", { ...(form.seo ?? {}), metaTitle: e.target.value })} />
        <Textarea label="Meta description" rows={3} value={form.seo?.metaDescription || ""} onChange={(e) => update("seo", { ...(form.seo ?? {}), metaDescription: e.target.value })} />
        <Textarea label="Keywords CSV" rows={2} value={keywordsCsv} onChange={(e) => setKeywordsCsv(e.target.value)} />
        <Input label="Canonical URL" value={form.seo?.canonicalUrl || ""} onChange={(e) => update("seo", { ...(form.seo ?? {}), canonicalUrl: e.target.value })} />
        <Input label="OG title" value={form.seo?.ogTitle || ""} onChange={(e) => update("seo", { ...(form.seo ?? {}), ogTitle: e.target.value })} />
        <Textarea label="OG description" rows={3} value={form.seo?.ogDescription || ""} onChange={(e) => update("seo", { ...(form.seo ?? {}), ogDescription: e.target.value })} />
        <AdminMediaUploader
          label="OG image"
          value={typeof form.seo?.ogImage === "object" ? form.seo.ogImage : undefined}
          folder={MEDIA_UPLOAD_FOLDERS.seo}
          usage="project-og"
          mediaType="image"
          onChange={(asset) => update("seo", { ...(form.seo ?? {}), ogImage: asset || undefined })}
        />
      </section>

      <div className="sticky bottom-0 z-20 border-t border-border bg-background/95 py-4 backdrop-blur">
        <Button type="submit" isLoading={saving} disabled={saving}>
          {mode === "create" ? "Create Project" : "Save Project"}
        </Button>
      </div>
    </form>
  );
}

