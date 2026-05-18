"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  JobDto,
  JobExperienceLevel,
  JobStatus,
  JobType,
  JobWorkMode,
} from "@/types/job";
import {
  JOB_EXPERIENCE_LABELS,
  JOB_TYPE_LABELS,
  JOB_WORK_MODE_LABELS,
} from "@/types/job";
import { Input } from "@/components/shared/Input";
import Textarea from "@/components/shared/Textarea";
import { Button } from "@/components/shared/Button";
import AdminMediaUploader from "@/components/admin/media/AdminMediaUploader";
import { MEDIA_UPLOAD_FOLDERS } from "@/constants/media-folders";
import { generateSlug } from "@/lib/slug";

type FormMode = "create" | "edit";

type StringArrayField = "responsibilities" | "requirements" | "benefits" | "skills";

const defaultJob: Partial<JobDto> = {
  title: "",
  slug: "",
  department: "",
  location: "",
  jobType: "full-time",
  workMode: "on-site",
  experienceLevel: "mid",
  experienceRequired: "",
  shortDescription: "",
  description: "",
  responsibilities: [],
  requirements: [],
  benefits: [],
  skills: [],
  applyEmail: "",
  applyUrl: "",
  applicationInstructions: "",
  deadline: undefined,
  status: "draft",
  isFeatured: false,
  order: 0,
  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: [],
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    robots: { index: true, follow: true },
    schemaType: "JobPosting",
  },
};

interface JobFormProps {
  mode: FormMode;
  initialJob?: Partial<JobDto>;
}

function deadlineToInput(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function deadlineToIso(dateInput?: string): string | undefined {
  if (!dateInput?.trim()) return undefined;
  const value = dateInput.includes("T") ? dateInput.slice(0, 10) : dateInput;
  return new Date(`${value}T23:59:59.999Z`).toISOString();
}

export default function JobForm({ mode, initialJob }: JobFormProps) {
  const router = useRouter();
  const merged = useMemo(
    () => ({
      ...defaultJob,
      ...initialJob,
      responsibilities: initialJob?.responsibilities ?? [],
      requirements: initialJob?.requirements ?? [],
      benefits: initialJob?.benefits ?? [],
      skills: initialJob?.skills ?? [],
      seo: {
        ...defaultJob.seo,
        ...initialJob?.seo,
        robots: {
          index: initialJob?.seo?.robots?.index ?? true,
          follow: initialJob?.seo?.robots?.follow ?? true,
        },
      },
    }),
    [initialJob]
  );

  const [form, setForm] = useState(merged);
  const [keywordsCsv, setKeywordsCsv] = useState(
    (initialJob?.seo?.keywords ?? []).join(", ")
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateSlugFromTitle(title: string) {
    if (mode === "create" && (!form.slug || form.slug === generateSlug(form.title || ""))) {
      update("slug", generateSlug(title));
    }
  }

  function addArrayItem(field: StringArrayField) {
    update(field, [...(form[field] ?? []), ""]);
  }

  function updateArrayItem(field: StringArrayField, idx: number, value: string) {
    const copy = [...(form[field] ?? [])];
    copy[idx] = value;
    update(field, copy);
  }

  function removeArrayItem(field: StringArrayField, idx: number) {
    const copy = [...(form[field] ?? [])];
    copy.splice(idx, 1);
    update(field, copy);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    const body = {
      ...form,
      deadline: deadlineToIso(form.deadline),
      seo: {
        ...form.seo,
        keywords: keywordsCsv
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
      },
    };

    const url =
      mode === "create" ? "/api/admin/jobs" : `/api/admin/jobs/${initialJob?.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to save job.");
      }
      const job = json?.data?.job;
      setMessage(mode === "create" ? "Job created successfully." : "Job saved successfully.");
      if (mode === "create" && job?.id) {
        router.replace(`/admin/jobs/${job.id}`);
      } else {
        update("slug", job?.slug || form.slug);
        if (job?.deadline) update("deadline", job.deadline);
        router.refresh();
      }
    } catch (errObj) {
      setError(errObj instanceof Error ? errObj.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  function renderStringArraySection(
    field: StringArrayField,
    title: string,
    addLabel: string
  ) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">{title}</h3>
          <Button type="button" size="sm" variant="outline" onClick={() => addArrayItem(field)}>
            {addLabel}
          </Button>
        </div>
        {(form[field] ?? []).map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <Input
              className="flex-1"
              value={item}
              onChange={(e) => updateArrayItem(field, idx, e.target.value)}
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => removeArrayItem(field, idx)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    );
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
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Department"
            value={form.department || ""}
            onChange={(e) => update("department", e.target.value)}
          />
          <Input
            label="Location"
            value={form.location || ""}
            onChange={(e) => update("location", e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-foreground">Job type</span>
            <select
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
              value={form.jobType || "full-time"}
              onChange={(e) => update("jobType", e.target.value as JobType)}
            >
              {(Object.entries(JOB_TYPE_LABELS) as [JobType, string][]).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-foreground">Work mode</span>
            <select
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
              value={form.workMode || "on-site"}
              onChange={(e) => update("workMode", e.target.value as JobWorkMode)}
            >
              {(Object.entries(JOB_WORK_MODE_LABELS) as [JobWorkMode, string][]).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                )
              )}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-foreground">Experience level</span>
            <select
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
              value={form.experienceLevel || "mid"}
              onChange={(e) =>
                update("experienceLevel", e.target.value as JobExperienceLevel)
              }
            >
              {(Object.entries(JOB_EXPERIENCE_LABELS) as [JobExperienceLevel, string][]).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                )
              )}
            </select>
          </label>
        </div>
        <Input
          label="Experience required"
          value={form.experienceRequired || ""}
          onChange={(e) => update("experienceRequired", e.target.value)}
          hint='e.g. "3+ years in HVAC engineering"'
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-foreground">Status</span>
            <select
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
              value={form.status || "draft"}
              onChange={(e) => update("status", e.target.value as JobStatus)}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <Input
            label="Order"
            type="number"
            value={String(form.order ?? 0)}
            onChange={(e) => update("order", Number(e.target.value || 0))}
          />
          <label className="flex items-center gap-2 pt-7 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={Boolean(form.isFeatured)}
              onChange={(e) => update("isFeatured", e.target.checked)}
            />
            Featured job
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">Content</h2>
        <Textarea
          label="Short description"
          rows={3}
          value={form.shortDescription || ""}
          onChange={(e) => update("shortDescription", e.target.value)}
        />
        <Textarea
          label="Description"
          rows={8}
          value={form.description || ""}
          onChange={(e) => update("description", e.target.value)}
        />
        {renderStringArraySection("responsibilities", "Responsibilities", "Add item")}
        {renderStringArraySection("requirements", "Requirements", "Add item")}
        {renderStringArraySection("benefits", "Benefits", "Add item")}
        {renderStringArraySection("skills", "Skills", "Add skill")}
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">Application</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Apply email"
            type="email"
            value={form.applyEmail || ""}
            onChange={(e) => update("applyEmail", e.target.value)}
          />
          <Input
            label="Apply URL"
            type="url"
            value={form.applyUrl || ""}
            onChange={(e) => update("applyUrl", e.target.value)}
          />
        </div>
        <Textarea
          label="Application instructions"
          rows={4}
          value={form.applicationInstructions || ""}
          onChange={(e) => update("applicationInstructions", e.target.value)}
        />
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">Application deadline</span>
          <input
            type="date"
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            value={deadlineToInput(form.deadline)}
            onChange={(e) =>
              update("deadline", e.target.value ? e.target.value : undefined)
            }
          />
        </label>
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
        <Input
          label="Canonical URL"
          value={form.seo?.canonicalUrl || ""}
          onChange={(e) => update("seo", { ...(form.seo ?? {}), canonicalUrl: e.target.value })}
        />
        <Input
          label="OG title"
          value={form.seo?.ogTitle || ""}
          onChange={(e) => update("seo", { ...(form.seo ?? {}), ogTitle: e.target.value })}
        />
        <Textarea
          label="OG description"
          rows={3}
          value={form.seo?.ogDescription || ""}
          onChange={(e) =>
            update("seo", { ...(form.seo ?? {}), ogDescription: e.target.value })
          }
        />
        <AdminMediaUploader
          label="OG image"
          value={typeof form.seo?.ogImage === "object" ? form.seo.ogImage : undefined}
          folder={MEDIA_UPLOAD_FOLDERS.seo}
          usage="job-og"
          mediaType="image"
          onChange={(asset) =>
            update("seo", {
              ...(form.seo ?? {}),
              ogImage: asset || undefined,
            })
          }
        />
        <div className="flex flex-wrap gap-6 text-sm">
          <label className="flex items-center gap-2 text-muted-foreground">
            <input
              type="checkbox"
              checked={form.seo?.robots?.index ?? true}
              onChange={(e) =>
                update("seo", {
                  ...(form.seo ?? {}),
                  robots: {
                    index: e.target.checked,
                    follow: form.seo?.robots?.follow ?? true,
                  },
                })
              }
            />
            Robots index
          </label>
          <label className="flex items-center gap-2 text-muted-foreground">
            <input
              type="checkbox"
              checked={form.seo?.robots?.follow ?? true}
              onChange={(e) =>
                update("seo", {
                  ...(form.seo ?? {}),
                  robots: {
                    index: form.seo?.robots?.index ?? true,
                    follow: e.target.checked,
                  },
                })
              }
            />
            Robots follow
          </label>
        </div>
        <Input
          label="Schema type"
          value={form.seo?.schemaType || "JobPosting"}
          onChange={(e) => update("seo", { ...(form.seo ?? {}), schemaType: e.target.value })}
        />
      </section>

      <div className="sticky bottom-0 z-20 border-t border-border bg-background/95 py-4 backdrop-blur">
        <Button type="submit" isLoading={saving} disabled={saving}>
          {mode === "create" ? "Create Job" : "Save Job"}
        </Button>
      </div>
    </form>
  );
}
