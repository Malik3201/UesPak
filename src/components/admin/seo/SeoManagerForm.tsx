"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/shared/Input";
import Textarea from "@/components/shared/Textarea";
import { Button } from "@/components/shared/Button";
import AdminMediaUploader from "@/components/admin/media/AdminMediaUploader";
import { MEDIA_UPLOAD_FOLDERS } from "@/constants/media-folders";
import { DEFAULT_SEO_SETTINGS } from "@/constants/seo-settings";
import type { SeoSettingsDTO, TwitterCardType } from "@/types/seo-setting";
import type { MediaObject } from "@/types/media";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export default function SeoManagerForm() {
  const [form, setForm] = useState<SeoSettingsDTO>({ ...DEFAULT_SEO_SETTINGS });
  const [keywordsCsv, setKeywordsCsv] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/seo", { credentials: "include" });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success) {
          throw new Error(json?.message || "Failed to load SEO settings.");
        }
        const settings = json.data.settings as SeoSettingsDTO;
        setForm(settings);
        setKeywordsCsv((settings.defaultKeywords || []).join(", "));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load settings.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  function update<K extends keyof SeoSettingsDTO>(key: K, value: SeoSettingsDTO[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addNoIndexPath() {
    update("noIndexPaths", [...(form.noIndexPaths || []), ""]);
  }

  function updateNoIndexPath(idx: number, value: string) {
    const copy = [...(form.noIndexPaths || [])];
    copy[idx] = value;
    update("noIndexPaths", copy);
  }

  function removeNoIndexPath(idx: number) {
    const copy = [...(form.noIndexPaths || [])];
    copy.splice(idx, 1);
    update("noIndexPaths", copy);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    const body = {
      ...form,
      defaultKeywords: keywordsCsv
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
    };

    try {
      const res = await fetch("/api/admin/seo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to save SEO settings.");
      }
      const settings = json.data.settings as SeoSettingsDTO;
      setForm(settings);
      setKeywordsCsv((settings.defaultKeywords || []).join(", "));
      setMessage("SEO settings saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading SEO settings…</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 pb-24">
      {message ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <Section
        title="Global SEO Defaults"
        description="Used when individual pages do not define their own metadata."
      >
        <Input
          label="Site name"
          value={form.siteName}
          onChange={(e) => update("siteName", e.target.value)}
        />
        <Input
          label="Site URL"
          value={form.siteUrl}
          onChange={(e) => update("siteUrl", e.target.value)}
          hint="https://uespak.com"
        />
        <Input
          label="Canonical base URL"
          value={form.canonicalBaseUrl || ""}
          onChange={(e) => update("canonicalBaseUrl", e.target.value || undefined)}
        />
        <Input
          label="Default meta title"
          value={form.defaultMetaTitle}
          onChange={(e) => update("defaultMetaTitle", e.target.value)}
        />
        <Textarea
          label="Default meta description"
          rows={3}
          value={form.defaultMetaDescription}
          onChange={(e) => update("defaultMetaDescription", e.target.value)}
        />
        <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
          Default keywords (comma separated)
          <textarea
            value={keywordsCsv}
            onChange={(e) => setKeywordsCsv(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
      </Section>

      <Section title="Open Graph / Social Sharing">
        <Input
          label="Default OG title"
          value={form.defaultOgTitle}
          onChange={(e) => update("defaultOgTitle", e.target.value)}
        />
        <Textarea
          label="Default OG description"
          rows={3}
          value={form.defaultOgDescription}
          onChange={(e) => update("defaultOgDescription", e.target.value)}
        />
        <AdminMediaUploader
          label="Default OG image"
          folder={MEDIA_UPLOAD_FOLDERS.seo}
          usage="seo-default-og"
          mediaType="image"
          maxSizeMB={5}
          showPreview
          value={form.defaultOgImage as MediaObject | undefined}
          onChange={(asset) => update("defaultOgImage", asset || undefined)}
          helperText="Recommended 1200×630px. Used when pages lack their own OG image."
        />
        <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
          Twitter card type
          <select
            value={form.twitterCard}
            onChange={(e) => update("twitterCard", e.target.value as TwitterCardType)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="summary">Summary</option>
            <option value="summary_large_image">Summary large image</option>
          </select>
        </label>
      </Section>

      <Section title="Robots / Indexing">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.robots.index}
            onChange={(e) =>
              update("robots", { ...form.robots, index: e.target.checked })
            }
          />
          Default robots: index
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.robots.follow}
            onChange={(e) =>
              update("robots", { ...form.robots, follow: e.target.checked })
            }
          />
          Default robots: follow
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.sitemapEnabled}
            onChange={(e) => update("sitemapEnabled", e.target.checked)}
          />
          Sitemap enabled
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.robotsTxtEnabled}
            onChange={(e) => update("robotsTxtEnabled", e.target.checked)}
          />
          robots.txt enabled
        </label>
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Noindex paths</p>
          {(form.noIndexPaths || []).map((path, idx) => (
            <div key={`noindex-${idx}`} className="flex gap-2">
              <Input
                label=""
                value={path}
                onChange={(e) => updateNoIndexPath(idx, e.target.value)}
                placeholder="/private-page or /draft/*"
              />
              <Button type="button" variant="ghost" onClick={() => removeNoIndexPath(idx)}>
                Remove
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addNoIndexPath}>
            Add path
          </Button>
        </div>
      </Section>

      <Section title="Verification & Analytics">
        <Input
          label="Google Search Console verification"
          value={form.googleSearchConsoleVerification || ""}
          onChange={(e) =>
            update("googleSearchConsoleVerification", e.target.value || undefined)
          }
        />
        <Input
          label="Bing verification"
          value={form.bingVerification || ""}
          onChange={(e) => update("bingVerification", e.target.value || undefined)}
        />
        <Input
          label="Google Analytics ID"
          value={form.googleAnalyticsId || ""}
          onChange={(e) => update("googleAnalyticsId", e.target.value || undefined)}
          hint="e.g. G-XXXXXXXXXX"
        />
        <Input
          label="Google Tag Manager ID"
          value={form.googleTagManagerId || ""}
          onChange={(e) => update("googleTagManagerId", e.target.value || undefined)}
          hint="e.g. GTM-XXXXXXX"
        />
      </Section>

      <Section title="SEO Overview">
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Page-level SEO in Home, Services, Projects, Team, Jobs, and Pages overrides these global defaults.</li>
          <li>Global SEO is used as a fallback when a page omits meta title, description, or OG image.</li>
          <li>Sitemap and robots.txt are technical SEO helpers controlled here.</li>
        </ul>
      </Section>

      <div className="sticky bottom-0 z-30 border-t border-border bg-background/90 py-4 backdrop-blur">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save SEO settings"}
        </Button>
      </div>
    </form>
  );
}
