"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Input from "@/components/shared/Input";
import Textarea from "@/components/shared/Textarea";
import Button from "@/components/shared/Button";
import AdminMediaUploader from "@/components/admin/media/AdminMediaUploader";
import { MEDIA_UPLOAD_FOLDERS } from "@/constants/media-folders";
import { getDefaultPageContent } from "@/constants/page-content";
import type {
  AboutPageContent,
  AnyPageContent,
  CareersPageContent,
  CatalogListingPageSections,
  ContactPageContent,
  PageKey,
  PageSimpleItem,
  ProjectsPageContent,
  ServicesPageContent,
} from "@/types/page-content";
import type { MediaObject } from "@/types/media";

type MediaAssetInput = Partial<MediaObject> & { filePath?: string };

interface PageContentFormProps {
  pageKey: PageKey;
}

const pageLabels: Record<PageKey, string> = {
  about: "About Page",
  careers: "Careers Page",
  contact: "Contact Page",
  services: "Services Page",
  projects: "Projects Page",
};

function isCatalogListingPageKey(
  pageKey: PageKey
): pageKey is "services" | "projects" {
  return pageKey === "services" || pageKey === "projects";
}

function normalizeMediaAsset(asset?: MediaAssetInput | null): MediaObject | undefined {
  if (!asset?.url) return undefined;
  const publicId = asset.publicId || asset.fileId || asset.filePath || "";
  return {
    url: asset.url,
    publicId,
    fileId: asset.fileId,
    altText: asset.altText || "",
    width: asset.width,
    height: asset.height,
    format: asset.format,
    size: asset.size,
    mimeType: asset.mimeType,
  };
}

function linesToArray(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function arrayToLines(value: string[]) {
  return (value || []).join("\n");
}

function itemWithOrder(item: PageSimpleItem, idx: number): PageSimpleItem {
  return { ...item, order: item.order ?? idx };
}

function ItemsEditor({
  title,
  items,
  onChange,
  descriptionPlaceholder = "Description",
}: {
  title: string;
  items: PageSimpleItem[];
  onChange: (items: PageSimpleItem[]) => void;
  descriptionPlaceholder?: string;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-border/80 bg-background/50 p-4">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            onChange([...(items || []), { title: "", description: "", order: items.length }])
          }
        >
          Add item
        </Button>
      </div>
      <div className="space-y-3">
        {(items || []).map((item, idx) => (
          <div key={idx} className="grid gap-3 rounded-md border border-border bg-card p-3 md:grid-cols-[1fr_1.4fr_auto]">
            <Input
              label="Title"
              value={item.title || ""}
              onChange={(e) => {
                const copy = [...items];
                copy[idx] = itemWithOrder({ ...copy[idx], title: e.target.value }, idx);
                onChange(copy);
              }}
            />
            <Textarea
              label={descriptionPlaceholder}
              rows={2}
              value={item.description || ""}
              onChange={(e) => {
                const copy = [...items];
                copy[idx] = itemWithOrder({ ...copy[idx], description: e.target.value }, idx);
                onChange(copy);
              }}
            />
            <div className="flex items-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange(items.filter((_, itemIdx) => itemIdx !== idx))}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PageContentForm({ pageKey }: PageContentFormProps) {
  const catalogListing = isCatalogListingPageKey(pageKey);
  const defaultPage = useMemo(() => getDefaultPageContent(pageKey), [pageKey]);
  const [form, setForm] = useState<AnyPageContent>(defaultPage);
  const [keywordsCsv, setKeywordsCsv] = useState(
    (defaultPage.seo.keywords || []).join(", ")
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function hydrate(loaded?: AnyPageContent | null) {
    const merged = {
      ...defaultPage,
      ...(loaded || {}),
      hero: { ...defaultPage.hero, ...(loaded?.hero || {}) },
      sections: {
        ...defaultPage.sections,
        ...((loaded?.sections || {}) as object),
      },
      seo: { ...defaultPage.seo, ...(loaded?.seo || {}) },
    } as AnyPageContent;
    setForm(merged);
    setKeywordsCsv((merged.seo.keywords || []).join(", "));
  }

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/pages/${pageKey}`, { credentials: "include" });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success) {
          throw new Error(json?.message || "Failed to load page.");
        }
        if (!cancelled) hydrate(json.data?.pageContent as AnyPageContent);
      } catch (errObj) {
        if (!cancelled) setError(errObj instanceof Error ? errObj.message : "Failed to load page.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // `hydrate` intentionally reads the latest defaultPage snapshot for this
    // page key. Re-running this effect on every function identity change would
    // cause duplicate admin API loads while typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageKey]);

  function setRoot(patch: Partial<AnyPageContent>) {
    setForm((prev) => ({ ...prev, ...patch }) as AnyPageContent);
  }

  function setHero(patch: Partial<AnyPageContent["hero"]>) {
    setForm((prev) => ({ ...prev, hero: { ...prev.hero, ...patch } }) as AnyPageContent);
  }

  function setSeo(patch: Partial<AnyPageContent["seo"]>) {
    setForm((prev) => ({ ...prev, seo: { ...prev.seo, ...patch } }) as AnyPageContent);
  }

  function setSections(next: AnyPageContent["sections"]) {
    setForm((prev) => ({ ...prev, sections: next }) as AnyPageContent);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const payload = {
        ...form,
        seo: {
          ...form.seo,
          keywords: keywordsCsv
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
        },
      };
      const res = await fetch(`/api/admin/pages/${pageKey}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        const details = json?.errors
          ? ` ${JSON.stringify(json.errors)}`
          : "";
        throw new Error(`${json?.message || "Failed to save page."}${details}`);
      }
      hydrate(json.data?.pageContent as AnyPageContent);
      setMessage("Page saved successfully.");
    } catch (errObj) {
      setError(errObj instanceof Error ? errObj.message : "Failed to save page.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Loading {pageLabels[pageKey]}...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Page Status</h2>
            <p className="text-xs text-muted-foreground">Controls top-level page title and active state.</p>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setRoot({ isActive: e.target.checked })}
            />
            Active
          </label>
        </div>
        <Input label="Admin title" value={form.title} onChange={(e) => setRoot({ title: e.target.value })} />
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">Hero</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Eyebrow" value={form.hero.eyebrow || ""} onChange={(e) => setHero({ eyebrow: e.target.value })} />
          <Input label="Title" value={form.hero.title || ""} onChange={(e) => setHero({ title: e.target.value })} />
        </div>
        <Textarea label="Description" rows={3} value={form.hero.description || ""} onChange={(e) => setHero({ description: e.target.value })} />
        <AdminMediaUploader
          label="Hero background image"
          value={form.hero.backgroundImage}
          folder={MEDIA_UPLOAD_FOLDERS.pages}
          usage={catalogListing ? `${pageKey}-page-hero` : `${pageKey}-hero`}
          mediaType="image"
          helperText="Large hero image used behind the dark green overlay."
          onChange={(asset) => setHero({ backgroundImage: normalizeMediaAsset(asset) })}
        />
        {catalogListing ? (
          <Input
            label="Hero overlay opacity (0–100%)"
            type="number"
            min={0}
            max={100}
            value={Math.round((form.hero.overlayOpacity ?? 0.88) * 100)}
            onChange={(e) => {
              const pct = Math.min(100, Math.max(0, Number(e.target.value) || 0));
              setHero({ overlayOpacity: pct / 100 });
            }}
            hint="Controls how strong the green overlay appears over the hero image."
          />
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Primary button text" value={form.hero.primaryButtonText || ""} onChange={(e) => setHero({ primaryButtonText: e.target.value })} />
          <Input label="Primary button URL" value={form.hero.primaryButtonUrl || ""} onChange={(e) => setHero({ primaryButtonUrl: e.target.value })} />
          {!catalogListing ? (
            <>
              <Input label="Secondary button text" value={form.hero.secondaryButtonText || ""} onChange={(e) => setHero({ secondaryButtonText: e.target.value })} />
              <Input label="Secondary button URL" value={form.hero.secondaryButtonUrl || ""} onChange={(e) => setHero({ secondaryButtonUrl: e.target.value })} />
            </>
          ) : null}
        </div>
      </section>

      {catalogListing ? (
        <CatalogListingSectionsEditor
          pageKey={pageKey}
          sections={(form as ServicesPageContent | ProjectsPageContent).sections}
          onChange={(sections) => setSections(sections)}
        />
      ) : pageKey === "about" ? (
        <AboutSectionsEditor page={form as AboutPageContent} onChange={(sections) => setSections(sections)} />
      ) : pageKey === "careers" ? (
        <CareersSectionsEditor page={form as CareersPageContent} onChange={(sections) => setSections(sections)} />
      ) : (
        <ContactSectionsEditor page={form as ContactPageContent} onChange={(sections) => setSections(sections)} />
      )}

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">SEO</h2>
        <Input label="Meta title" maxLength={70} value={form.seo.metaTitle || ""} onChange={(e) => setSeo({ metaTitle: e.target.value })} />
        <Textarea label="Meta description" rows={3} maxLength={180} value={form.seo.metaDescription || ""} onChange={(e) => setSeo({ metaDescription: e.target.value })} />
        <Textarea label="Keywords CSV" rows={2} value={keywordsCsv} onChange={(e) => setKeywordsCsv(e.target.value)} />
        <Input label="Canonical URL" value={form.seo.canonicalUrl || ""} onChange={(e) => setSeo({ canonicalUrl: e.target.value })} />
        <Input label="OG title" value={form.seo.ogTitle || ""} onChange={(e) => setSeo({ ogTitle: e.target.value })} />
        <Textarea label="OG description" rows={3} maxLength={200} value={form.seo.ogDescription || ""} onChange={(e) => setSeo({ ogDescription: e.target.value })} />
        <AdminMediaUploader
          label="OG image"
          value={typeof form.seo.ogImage === "object" ? form.seo.ogImage : undefined}
          folder={MEDIA_UPLOAD_FOLDERS.seo}
          usage="page-og"
          mediaType="image"
          onChange={(asset) => setSeo({ ogImage: normalizeMediaAsset(asset) })}
        />
        <div className="grid gap-4 md:grid-cols-3">
          <Input label="Schema type" value={form.seo.schemaType || ""} onChange={(e) => setSeo({ schemaType: e.target.value })} />
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={form.seo.robots?.index ?? true} onChange={(e) => setSeo({ robots: { ...(form.seo.robots || { follow: true }), index: e.target.checked } })} />
            Index
          </label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={form.seo.robots?.follow ?? true} onChange={(e) => setSeo({ robots: { ...(form.seo.robots || { index: true }), follow: e.target.checked } })} />
            Follow
          </label>
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" isLoading={saving}>
          Save {pageLabels[pageKey]}
        </Button>
      </div>
    </form>
  );
}

function CatalogListingSectionsEditor({
  pageKey,
  sections,
  onChange,
}: {
  pageKey: "services" | "projects";
  sections: CatalogListingPageSections;
  onChange: (sections: CatalogListingPageSections) => void;
}) {
  const s = sections;
  const update = (patch: Partial<CatalogListingPageSections>) => onChange({ ...s, ...patch });
  const label = pageKey === "services" ? "Services" : "Projects";

  return (
    <section className="space-y-5 rounded-xl border border-border bg-card p-5">
      <h2 className="text-base font-semibold text-foreground">{label} Listing Page</h2>

      <div className="space-y-4 rounded-lg border border-border p-4">
        <h3 className="text-sm font-semibold">Intro (above cards)</h3>
        <Input
          label="Title"
          value={s.intro.title || ""}
          onChange={(e) => update({ intro: { ...s.intro, title: e.target.value } })}
        />
        <Textarea
          label="Description"
          rows={3}
          value={s.intro.description || ""}
          onChange={(e) => update({ intro: { ...s.intro, description: e.target.value } })}
        />
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={s.intro.showGroupTabs}
            onChange={(e) =>
              update({ intro: { ...s.intro, showGroupTabs: e.target.checked } })
            }
          />
          Show group filter tabs on public listing page
        </label>
      </div>

      <div className="space-y-4 rounded-lg border border-border p-4">
        <h3 className="text-sm font-semibold">Bottom CTA</h3>
        <Input
          label="Title"
          value={s.cta.title || ""}
          onChange={(e) => update({ cta: { ...s.cta, title: e.target.value } })}
        />
        <Textarea
          label="Description"
          rows={3}
          value={s.cta.description || ""}
          onChange={(e) => update({ cta: { ...s.cta, description: e.target.value } })}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Button text"
            value={s.cta.buttonText || ""}
            onChange={(e) => update({ cta: { ...s.cta, buttonText: e.target.value } })}
          />
          <Input
            label="Button URL"
            value={s.cta.buttonUrl || ""}
            onChange={(e) => update({ cta: { ...s.cta, buttonUrl: e.target.value } })}
          />
        </div>
        <AdminMediaUploader
          label="CTA background image (optional)"
          value={s.cta.backgroundImage}
          folder={MEDIA_UPLOAD_FOLDERS.pages}
          usage={`${pageKey}-page-cta`}
          mediaType="image"
          onChange={(asset) =>
            update({ cta: { ...s.cta, backgroundImage: normalizeMediaAsset(asset) } })
          }
        />
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={s.cta.isActive}
            onChange={(e) => update({ cta: { ...s.cta, isActive: e.target.checked } })}
          />
          Show bottom CTA on public page
        </label>
      </div>
    </section>
  );
}

function AboutSectionsEditor({
  page,
  onChange,
}: {
  page: AboutPageContent;
  onChange: (sections: AboutPageContent["sections"]) => void;
}) {
  const s = page.sections;
  const update = (patch: Partial<AboutPageContent["sections"]>) => onChange({ ...s, ...patch });
  return (
    <section className="space-y-5 rounded-xl border border-border bg-card p-5">
      <h2 className="text-base font-semibold text-foreground">About Page Sections</h2>
      <div className="space-y-4 rounded-lg border border-border p-4">
        <h3 className="text-sm font-semibold">Company Overview</h3>
        <Input label="Title" value={s.overview.title || ""} onChange={(e) => update({ overview: { ...s.overview, title: e.target.value } })} />
        <Textarea label="Description" rows={4} value={s.overview.description || ""} onChange={(e) => update({ overview: { ...s.overview, description: e.target.value } })} />
        <Textarea label="Highlights (one per line)" rows={4} value={arrayToLines(s.overview.highlights)} onChange={(e) => update({ overview: { ...s.overview, highlights: linesToArray(e.target.value) } })} />
        <AdminMediaUploader label="Overview image" value={s.overview.image} folder={MEDIA_UPLOAD_FOLDERS.pages} usage="about-overview" mediaType="image" onChange={(asset) => update({ overview: { ...s.overview, image: normalizeMediaAsset(asset) } })} />
      </div>
      <div className="space-y-4 rounded-lg border border-border p-4">
        <h3 className="text-sm font-semibold">Our Story</h3>
        <Input label="Title" value={s.story.title || ""} onChange={(e) => update({ story: { ...s.story, title: e.target.value } })} />
        <Textarea label="Description" rows={4} value={s.story.description || ""} onChange={(e) => update({ story: { ...s.story, description: e.target.value } })} />
        <AdminMediaUploader label="Story image" value={s.story.image} folder={MEDIA_UPLOAD_FOLDERS.pages} usage="about-story" mediaType="image" onChange={(asset) => update({ story: { ...s.story, image: normalizeMediaAsset(asset) } })} />
      </div>
      <div className="space-y-4 rounded-lg border border-border p-4">
        <h3 className="text-sm font-semibold">Vision / Mission / Values</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Vision title" value={s.visionMission.visionTitle || ""} onChange={(e) => update({ visionMission: { ...s.visionMission, visionTitle: e.target.value } })} />
          <Input label="Mission title" value={s.visionMission.missionTitle || ""} onChange={(e) => update({ visionMission: { ...s.visionMission, missionTitle: e.target.value } })} />
        </div>
        <Textarea label="Vision description" rows={3} value={s.visionMission.visionDescription || ""} onChange={(e) => update({ visionMission: { ...s.visionMission, visionDescription: e.target.value } })} />
        <Textarea label="Mission description" rows={3} value={s.visionMission.missionDescription || ""} onChange={(e) => update({ visionMission: { ...s.visionMission, missionDescription: e.target.value } })} />
        <ItemsEditor title="Values" items={s.visionMission.values} onChange={(items) => update({ visionMission: { ...s.visionMission, values: items } })} />
      </div>
      <ItemsEditor title="Capabilities / What We Do" items={s.capabilities.items} onChange={(items) => update({ capabilities: { ...s.capabilities, items } })} />
      <ItemsEditor title="Why Choose UESPAK" items={s.whyChoose.items} onChange={(items) => update({ whyChoose: { ...s.whyChoose, items } })} />
      <div className="space-y-4 rounded-lg border border-border p-4">
        <h3 className="text-sm font-semibold">CTA</h3>
        <Input label="Title" value={s.cta.title || ""} onChange={(e) => update({ cta: { ...s.cta, title: e.target.value } })} />
        <Textarea label="Description" rows={3} value={s.cta.description || ""} onChange={(e) => update({ cta: { ...s.cta, description: e.target.value } })} />
        <Input label="Button text" value={s.cta.buttonText || ""} onChange={(e) => update({ cta: { ...s.cta, buttonText: e.target.value } })} />
        <Input label="Button URL" value={s.cta.buttonUrl || ""} onChange={(e) => update({ cta: { ...s.cta, buttonUrl: e.target.value } })} />
        <AdminMediaUploader label="CTA background image" value={s.cta.backgroundImage} folder={MEDIA_UPLOAD_FOLDERS.pages} usage="about-cta" mediaType="image" onChange={(asset) => update({ cta: { ...s.cta, backgroundImage: normalizeMediaAsset(asset) } })} />
      </div>
    </section>
  );
}

function CareersSectionsEditor({
  page,
  onChange,
}: {
  page: CareersPageContent;
  onChange: (sections: CareersPageContent["sections"]) => void;
}) {
  const s = page.sections;
  const update = (patch: Partial<CareersPageContent["sections"]>) => onChange({ ...s, ...patch });
  return (
    <section className="space-y-5 rounded-xl border border-border bg-card p-5">
      <h2 className="text-base font-semibold text-foreground">Careers Page Sections</h2>
      <div className="space-y-4 rounded-lg border border-border p-4">
        <h3 className="text-sm font-semibold">Careers Intro</h3>
        <Input label="Title" value={s.intro.title || ""} onChange={(e) => update({ intro: { ...s.intro, title: e.target.value } })} />
        <Textarea label="Description" rows={4} value={s.intro.description || ""} onChange={(e) => update({ intro: { ...s.intro, description: e.target.value } })} />
        <AdminMediaUploader label="Intro image" value={s.intro.image} folder={MEDIA_UPLOAD_FOLDERS.pages} usage="careers-intro" mediaType="image" onChange={(asset) => update({ intro: { ...s.intro, image: normalizeMediaAsset(asset) } })} />
      </div>
      <ItemsEditor title="Why Work With UESPAK" items={s.whyWork.items} onChange={(items) => update({ whyWork: { ...s.whyWork, items } })} />
      <ItemsEditor title="Culture / Values" items={s.culture.values} onChange={(values) => update({ culture: { ...s.culture, values } })} />
      <div className="space-y-4 rounded-lg border border-border p-4">
        <h3 className="text-sm font-semibold">Team Section Intro</h3>
        <Input label="Title" value={s.teamIntro.title || ""} onChange={(e) => update({ teamIntro: { ...s.teamIntro, title: e.target.value } })} />
        <Textarea label="Description" rows={3} value={s.teamIntro.description || ""} onChange={(e) => update({ teamIntro: { ...s.teamIntro, description: e.target.value } })} />
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={s.teamIntro.showTeamMembers} onChange={(e) => update({ teamIntro: { ...s.teamIntro, showTeamMembers: e.target.checked } })} />
          Show team members on public Careers page
        </label>
      </div>
      <div className="space-y-4 rounded-lg border border-border p-4">
        <h3 className="text-sm font-semibold">Apply CTA</h3>
        <Input label="Title" value={s.applyCTA.title || ""} onChange={(e) => update({ applyCTA: { ...s.applyCTA, title: e.target.value } })} />
        <Textarea label="Description" rows={3} value={s.applyCTA.description || ""} onChange={(e) => update({ applyCTA: { ...s.applyCTA, description: e.target.value } })} />
        <Input label="Button text" value={s.applyCTA.buttonText || ""} onChange={(e) => update({ applyCTA: { ...s.applyCTA, buttonText: e.target.value } })} />
        <Input label="Button URL" value={s.applyCTA.buttonUrl || ""} onChange={(e) => update({ applyCTA: { ...s.applyCTA, buttonUrl: e.target.value } })} />
        <Input label="Apply email" value={s.applyCTA.email || ""} onChange={(e) => update({ applyCTA: { ...s.applyCTA, email: e.target.value } })} />
        <AdminMediaUploader label="CTA background image" value={s.applyCTA.backgroundImage} folder={MEDIA_UPLOAD_FOLDERS.pages} usage="careers-cta" mediaType="image" onChange={(asset) => update({ applyCTA: { ...s.applyCTA, backgroundImage: normalizeMediaAsset(asset) } })} />
      </div>
    </section>
  );
}

function ContactSectionsEditor({
  page,
  onChange,
}: {
  page: ContactPageContent;
  onChange: (sections: ContactPageContent["sections"]) => void;
}) {
  const s = page.sections;
  const update = (patch: Partial<ContactPageContent["sections"]>) => onChange({ ...s, ...patch });
  return (
    <section className="space-y-5 rounded-xl border border-border bg-card p-5">
      <h2 className="text-base font-semibold text-foreground">Contact Page Sections</h2>
      <div className="space-y-4 rounded-lg border border-border p-4">
        <h3 className="text-sm font-semibold">Contact Info</h3>
        <Input label="Title" value={s.info.title || ""} onChange={(e) => update({ info: { ...s.info, title: e.target.value } })} />
        <Textarea label="Description" rows={3} value={s.info.description || ""} onChange={(e) => update({ info: { ...s.info, description: e.target.value } })} />
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Phone override" value={s.info.phone || ""} onChange={(e) => update({ info: { ...s.info, phone: e.target.value } })} />
          <Input label="Email override" value={s.info.email || ""} onChange={(e) => update({ info: { ...s.info, email: e.target.value } })} />
          <Input label="Address override" value={s.info.address || ""} onChange={(e) => update({ info: { ...s.info, address: e.target.value } })} />
          <Input label="Working hours override" value={s.info.workingHours || ""} onChange={(e) => update({ info: { ...s.info, workingHours: e.target.value } })} />
        </div>
      </div>
      <div className="space-y-4 rounded-lg border border-border p-4">
        <h3 className="text-sm font-semibold">Contact Form</h3>
        <Input label="Title" value={s.form.title || ""} onChange={(e) => update({ form: { ...s.form, title: e.target.value } })} />
        <Textarea label="Description" rows={3} value={s.form.description || ""} onChange={(e) => update({ form: { ...s.form, description: e.target.value } })} />
        <Input label="Submit button text" value={s.form.submitButtonText || ""} onChange={(e) => update({ form: { ...s.form, submitButtonText: e.target.value } })} />
        <Textarea label="Service options (one per line)" rows={5} value={arrayToLines(s.form.serviceOptions)} onChange={(e) => update({ form: { ...s.form, serviceOptions: linesToArray(e.target.value) } })} />
      </div>
      <div className="space-y-4 rounded-lg border border-border p-4">
        <h3 className="text-sm font-semibold">Map</h3>
        <Input label="Title" value={s.map.title || ""} onChange={(e) => update({ map: { ...s.map, title: e.target.value } })} />
        <Textarea label="Description" rows={3} value={s.map.description || ""} onChange={(e) => update({ map: { ...s.map, description: e.target.value } })} />
        <Input label="Map embed override (optional)" value={s.map.embedUrl || ""} onChange={(e) => update({ map: { ...s.map, embedUrl: e.target.value } })} hint="Leave empty to use Site Settings map embed URL." />
      </div>
      <ItemsEditor title="Support cards" items={s.support.items} onChange={(items) => update({ support: { ...s.support, items } })} />
    </section>
  );
}
