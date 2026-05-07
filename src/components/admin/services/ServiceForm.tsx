"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ServiceDto, ServiceGroup, ServiceStatus } from "@/types/service";
import { SERVICE_GROUPS, getServiceGroupLabel } from "@/types/service";
import type { MediaObject } from "@/types/media";
import { Input } from "@/components/shared/Input";
import Textarea from "@/components/shared/Textarea";
import { Button } from "@/components/shared/Button";
import AdminMediaUploader from "@/components/admin/media/AdminMediaUploader";
import { MEDIA_UPLOAD_FOLDERS } from "@/constants/media-folders";
import { generateSlug } from "@/lib/slug";

type FormMode = "create" | "edit";

const defaultService: Partial<ServiceDto> = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  serviceGroup: "engineering",
  category: "",
  icon: "",
  status: "draft",
  order: 0,
  isFeatured: false,
  bulletPoints: [],
  faqs: [],
  gallery: [],
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
    schemaType: "Service",
  },
};

interface ServiceFormProps {
  mode: FormMode;
  initialService?: Partial<ServiceDto>;
}

export default function ServiceForm({ mode, initialService }: ServiceFormProps) {
  const router = useRouter();
  const merged = useMemo(
    () => ({
      ...defaultService,
      ...initialService,
      gallery: initialService?.gallery ?? [],
      bulletPoints: initialService?.bulletPoints ?? [],
      faqs: initialService?.faqs ?? [],
      cta: { ...defaultService.cta, ...initialService?.cta },
      seo: {
        ...defaultService.seo,
        ...initialService?.seo,
        robots: {
          index: initialService?.seo?.robots?.index ?? true,
          follow: initialService?.seo?.robots?.follow ?? true,
        },
      },
    }),
    [initialService]
  );

  const [form, setForm] = useState(merged);
  const [keywordsCsv, setKeywordsCsv] = useState(
    (initialService?.seo?.keywords ?? []).join(", ")
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

  function addBulletPoint() {
    update("bulletPoints", [...(form.bulletPoints ?? []), ""]);
  }

  function addFaq() {
    update("faqs", [...(form.faqs ?? []), { question: "", answer: "" }]);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

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
        ? "/api/admin/services"
        : `/api/admin/services/${initialService?.id}`;
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
        throw new Error(json?.message || "Failed to save service.");
      }
      const service = json?.data?.service;
      setMessage(mode === "create" ? "Service created successfully." : "Service saved successfully.");
      if (mode === "create" && service?.id) {
        router.replace(`/admin/services/${service.id}`);
      } else {
        update("slug", service?.slug || form.slug);
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
          label="Title"
          required
          value={form.title || ""}
          onChange={(e) => {
            const title = e.target.value;
            update("title", title);
            updateSlugFromTitle(title);
          }}
        />
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">Service Group</span>
          <select
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            value={(form.serviceGroup as ServiceGroup | undefined) || "engineering"}
            onChange={(e) => update("serviceGroup", e.target.value as ServiceGroup)}
          >
            {SERVICE_GROUPS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-muted-foreground">
            Controls where this service appears in the Services menu and listing pages (
            {getServiceGroupLabel(
              ((form.serviceGroup as ServiceGroup | undefined) || "engineering") as ServiceGroup
            )}
            ).
          </span>
        </label>
        <Input
          label="Slug"
          value={form.slug || ""}
          onChange={(e) => update("slug", generateSlug(e.target.value))}
          hint="URL-safe lowercase slug."
        />
        <Textarea
          label="Excerpt"
          rows={3}
          value={form.excerpt || ""}
          onChange={(e) => update("excerpt", e.target.value)}
        />
        <Input
          label="Category"
          value={form.category || ""}
          onChange={(e) => update("category", e.target.value)}
          hint="Optional specific classification (e.g., HVAC-R, Facility Management, Regenerative Farming)."
        />
        <Input
          label="Icon class/name (optional)"
          value={form.icon || ""}
          onChange={(e) => update("icon", e.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-foreground">Status</span>
            <select
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
              value={form.status || "draft"}
              onChange={(e) => update("status", e.target.value as ServiceStatus)}
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
            Featured service
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">Content</h2>
        <Textarea
          label="Main content"
          rows={8}
          value={form.content || ""}
          onChange={(e) => update("content", e.target.value)}
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Bullet points</h3>
            <Button type="button" size="sm" variant="outline" onClick={addBulletPoint}>
              Add bullet
            </Button>
          </div>
          {(form.bulletPoints ?? []).map((point, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                className="flex-1"
                value={point}
                onChange={(e) => {
                  const copy = [...(form.bulletPoints ?? [])];
                  copy[idx] = e.target.value;
                  update("bulletPoints", copy);
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  const copy = [...(form.bulletPoints ?? [])];
                  copy.splice(idx, 1);
                  update("bulletPoints", copy);
                }}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">FAQs</h3>
            <Button type="button" size="sm" variant="outline" onClick={addFaq}>
              Add FAQ
            </Button>
          </div>
          {(form.faqs ?? []).map((faq, idx) => (
            <div key={idx} className="space-y-2 rounded-md border border-border p-3">
              <Input
                label={`Question ${idx + 1}`}
                value={faq.question}
                onChange={(e) => {
                  const copy = [...(form.faqs ?? [])];
                  copy[idx] = { ...copy[idx], question: e.target.value };
                  update("faqs", copy);
                }}
              />
              <Textarea
                label="Answer"
                rows={3}
                value={faq.answer}
                onChange={(e) => {
                  const copy = [...(form.faqs ?? [])];
                  copy[idx] = { ...copy[idx], answer: e.target.value };
                  update("faqs", copy);
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  const copy = [...(form.faqs ?? [])];
                  copy.splice(idx, 1);
                  update("faqs", copy);
                }}
              >
                Remove FAQ
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">Media</h2>
        <AdminMediaUploader
          label="Featured image"
          value={form.featuredImage}
          folder={MEDIA_UPLOAD_FOLDERS.services}
          usage="service-featured"
          mediaType="image"
          onChange={(asset) => update("featuredImage", asset as MediaObject)}
        />
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Gallery</h3>
          <AdminMediaUploader
            label="Add gallery image"
            folder={MEDIA_UPLOAD_FOLDERS.services}
            usage="service-gallery"
            mediaType="image"
            onChange={(asset) => {
              if (!asset) return;
              update("gallery", [...(form.gallery ?? []), asset]);
            }}
          />
          {(form.gallery ?? []).length ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {form.gallery?.map((img, idx) => (
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const copy = [...(form.gallery ?? [])];
                      copy.splice(idx, 1);
                      update("gallery", copy);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">CTA</h2>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={Boolean(form.cta?.isActive)}
            onChange={(e) =>
              update("cta", { ...(form.cta ?? { isActive: false }), isActive: e.target.checked })
            }
          />
          CTA enabled
        </label>
        <Input
          label="CTA title"
          value={form.cta?.title || ""}
          onChange={(e) => update("cta", { ...(form.cta ?? { isActive: false }), title: e.target.value })}
        />
        <Textarea
          label="CTA description"
          rows={3}
          value={form.cta?.description || ""}
          onChange={(e) =>
            update("cta", { ...(form.cta ?? { isActive: false }), description: e.target.value })
          }
        />
        <Input
          label="CTA button text"
          value={form.cta?.buttonText || ""}
          onChange={(e) =>
            update("cta", { ...(form.cta ?? { isActive: false }), buttonText: e.target.value })
          }
        />
        <Input
          label="CTA button URL"
          value={form.cta?.buttonUrl || ""}
          onChange={(e) =>
            update("cta", { ...(form.cta ?? { isActive: false }), buttonUrl: e.target.value })
          }
        />
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
          onChange={(e) => update("seo", { ...(form.seo ?? {}), ogDescription: e.target.value })}
        />
        <AdminMediaUploader
          label="OG image"
          value={typeof form.seo?.ogImage === "object" ? form.seo.ogImage : undefined}
          folder={MEDIA_UPLOAD_FOLDERS.seo}
          usage="service-og"
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
          value={form.seo?.schemaType || "Service"}
          onChange={(e) => update("seo", { ...(form.seo ?? {}), schemaType: e.target.value })}
        />
      </section>

      <div className="sticky bottom-0 z-20 border-t border-border bg-background/95 py-4 backdrop-blur">
        <Button type="submit" isLoading={saving} disabled={saving}>
          {mode === "create" ? "Create Service" : "Save Service"}
        </Button>
      </div>
    </form>
  );
}
