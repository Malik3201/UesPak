"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/shared/Input";
import Textarea from "@/components/shared/Textarea";
import { Button } from "@/components/shared/Button";
import AdminMediaUploader from "@/components/admin/media/AdminMediaUploader";
import { MEDIA_UPLOAD_FOLDERS } from "@/constants/media-folders";
import type { HomePageContent } from "@/types/home-page";
import { getDefaultHomePageContent } from "@/constants/home-page";

interface OptionRow {
  id: string;
  title: string;
}

export default function HomePageForm() {
  const [form, setForm] = useState<HomePageContent>(getDefaultHomePageContent());
  const [services, setServices] = useState<OptionRow[]>([]);
  const [projects, setProjects] = useState<OptionRow[]>([]);
  const [keywordsCsv, setKeywordsCsv] = useState(
    getDefaultHomePageContent().seo.keywords?.join(", ") || ""
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function setPath<K extends keyof HomePageContent>(key: K, value: HomePageContent[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateNested<T extends keyof HomePageContent>(
    key: T,
    patch: Partial<HomePageContent[T]>
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] as object),
        ...patch,
      } as HomePageContent[T],
    }));
  }

  useEffect(() => {
    void (async () => {
      try {
        const [homeRes, servicesRes, projectsRes] = await Promise.all([
          fetch("/api/admin/home", { credentials: "include" }),
          fetch("/api/admin/services?status=published&limit=300", {
            credentials: "include",
          }),
          fetch("/api/admin/projects?status=published&limit=300", {
            credentials: "include",
          }),
        ]);

        const homeJson = await homeRes.json().catch(() => null);
        const servicesJson = await servicesRes.json().catch(() => null);
        const projectsJson = await projectsRes.json().catch(() => null);

        if (!homeRes.ok || !homeJson?.success) {
          throw new Error(homeJson?.message || "Failed to load home page settings.");
        }

        const loaded = homeJson?.data?.homePage as HomePageContent;
        const merged = {
          ...getDefaultHomePageContent(),
          ...loaded,
        };
        setForm(merged);
        setKeywordsCsv((merged.seo?.keywords ?? []).join(", "));
        const servicesRows = (servicesJson?.data?.services as Array<{ id: string; title: string }>) || [];
        const projectsRows = (projectsJson?.data?.projects as Array<{ id: string; title: string }>) || [];
        setServices(servicesRows.map((s) => ({ id: s.id, title: s.title })));
        setProjects(projectsRows.map((p) => ({ id: p.id, title: p.title })));
      } catch (errObj) {
        setError(errObj instanceof Error ? errObj.message : "Failed to load data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
      const res = await fetch("/api/admin/home", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to save home page.");
      }
      const saved = json?.data?.homePage as HomePageContent;
      if (saved) {
        setForm({ ...getDefaultHomePageContent(), ...saved });
        setKeywordsCsv((saved.seo?.keywords ?? []).join(", "));
      }
      setMessage("Home page saved successfully.");
    } catch (errObj) {
      setError(errObj instanceof Error ? errObj.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  function renderStringArrayEditor(
    title: string,
    values: string[],
    onChange: (next: string[]) => void
  ) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">{title}</h3>
          <Button type="button" size="sm" variant="outline" onClick={() => onChange([...(values || []), ""])}>
            Add
          </Button>
        </div>
        {(values || []).map((item, idx) => (
          <div key={`${title}-${idx}`} className="flex items-center gap-2">
            <Input
              className="flex-1"
              value={item}
              onChange={(e) => {
                const copy = [...(values || [])];
                copy[idx] = e.target.value;
                onChange(copy);
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                const copy = [...(values || [])];
                copy.splice(idx, 1);
                onChange(copy);
              }}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">
        Loading home page settings...
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
        <h2 className="text-base font-semibold text-foreground">Hero</h2>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={Boolean(form.hero.isActive)}
            onChange={(e) => updateNested("hero", { isActive: e.target.checked })}
          />
          Section active
        </label>
        <Input label="Eyebrow" value={form.hero.eyebrow || ""} onChange={(e) => updateNested("hero", { eyebrow: e.target.value })} />
        <Input label="Title" value={form.hero.title || ""} onChange={(e) => updateNested("hero", { title: e.target.value })} />
        <Input label="Subtitle" value={form.hero.subtitle || ""} onChange={(e) => updateNested("hero", { subtitle: e.target.value })} />
        <Textarea label="Description" rows={4} value={form.hero.description || ""} onChange={(e) => updateNested("hero", { description: e.target.value })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Primary button text" value={form.hero.primaryButtonText || ""} onChange={(e) => updateNested("hero", { primaryButtonText: e.target.value })} />
          <Input label="Primary button URL" value={form.hero.primaryButtonUrl || ""} onChange={(e) => updateNested("hero", { primaryButtonUrl: e.target.value })} />
          <Input label="Secondary button text" value={form.hero.secondaryButtonText || ""} onChange={(e) => updateNested("hero", { secondaryButtonText: e.target.value })} />
          <Input label="Secondary button URL" value={form.hero.secondaryButtonUrl || ""} onChange={(e) => updateNested("hero", { secondaryButtonUrl: e.target.value })} />
        </div>
        <AdminMediaUploader
          label="Hero background image"
          value={form.hero.backgroundImage}
          folder={MEDIA_UPLOAD_FOLDERS.general.replace("/general", "/home")}
          usage="home-hero-background"
          mediaType="image"
          onChange={(asset) => updateNested("hero", { backgroundImage: asset || undefined })}
        />
        <AdminMediaUploader
          label="Hero foreground image"
          value={form.hero.foregroundImage}
          folder={MEDIA_UPLOAD_FOLDERS.general.replace("/general", "/home")}
          usage="home-hero-foreground"
          mediaType="image"
          onChange={(asset) => updateNested("hero", { foregroundImage: asset || undefined })}
        />
        {renderStringArrayEditor("Badges", form.hero.badges || [], (next) =>
          updateNested("hero", { badges: next })
        )}
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">Featured Services</h2>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={Boolean(form.featuredServices.isActive)} onChange={(e) => updateNested("featuredServices", { isActive: e.target.checked })} />
          Section active
        </label>
        <Input label="Title" value={form.featuredServices.title || ""} onChange={(e) => updateNested("featuredServices", { title: e.target.value })} />
        <Input label="Subtitle" value={form.featuredServices.subtitle || ""} onChange={(e) => updateNested("featuredServices", { subtitle: e.target.value })} />
        <Textarea label="Description" rows={3} value={form.featuredServices.description || ""} onChange={(e) => updateNested("featuredServices", { description: e.target.value })} />
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">Selected Services</span>
          <select
            multiple
            className="min-h-32 rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={form.featuredServices.serviceIds || []}
            onChange={(e) =>
              updateNested("featuredServices", {
                serviceIds: Array.from(e.target.selectedOptions).map((o) => o.value),
              })
            }
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">Services Overview</h2>
        <label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={Boolean(form.servicesOverview.isActive)} onChange={(e) => updateNested("servicesOverview", { isActive: e.target.checked })} />Section active</label>
        <Input label="Eyebrow" value={form.servicesOverview.eyebrow || ""} onChange={(e) => updateNested("servicesOverview", { eyebrow: e.target.value })} />
        <Input label="Title" value={form.servicesOverview.title || ""} onChange={(e) => updateNested("servicesOverview", { title: e.target.value })} />
        <Textarea label="Description" rows={3} value={form.servicesOverview.description || ""} onChange={(e) => updateNested("servicesOverview", { description: e.target.value })} />
        <AdminMediaUploader label="Overview image" value={form.servicesOverview.image} folder={MEDIA_UPLOAD_FOLDERS.general.replace("/general", "/home")} usage="home-services-overview" mediaType="image" onChange={(asset) => updateNested("servicesOverview", { image: asset || undefined })} />
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">Why Choose Us</h2>
        <label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={Boolean(form.whyChooseUs.isActive)} onChange={(e) => updateNested("whyChooseUs", { isActive: e.target.checked })} />Section active</label>
        <Input label="Eyebrow" value={form.whyChooseUs.eyebrow || ""} onChange={(e) => updateNested("whyChooseUs", { eyebrow: e.target.value })} />
        <Input label="Title" value={form.whyChooseUs.title || ""} onChange={(e) => updateNested("whyChooseUs", { title: e.target.value })} />
        <Textarea label="Description" rows={3} value={form.whyChooseUs.description || ""} onChange={(e) => updateNested("whyChooseUs", { description: e.target.value })} />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Items</h3>
            <Button type="button" size="sm" variant="outline" onClick={() => updateNested("whyChooseUs", { items: [...(form.whyChooseUs.items || []), { title: "", description: "", icon: "", order: 0 }] })}>Add item</Button>
          </div>
          {(form.whyChooseUs.items || []).map((item, idx) => (
            <div key={`why-${idx}`} className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-2">
              <Input label="Title" value={item.title || ""} onChange={(e) => {
                const copy = [...(form.whyChooseUs.items || [])];
                copy[idx] = { ...copy[idx], title: e.target.value };
                updateNested("whyChooseUs", { items: copy });
              }} />
              <Input label="Icon" value={item.icon || ""} onChange={(e) => {
                const copy = [...(form.whyChooseUs.items || [])];
                copy[idx] = { ...copy[idx], icon: e.target.value };
                updateNested("whyChooseUs", { items: copy });
              }} />
              <Textarea label="Description" rows={2} value={item.description || ""} onChange={(e) => {
                const copy = [...(form.whyChooseUs.items || [])];
                copy[idx] = { ...copy[idx], description: e.target.value };
                updateNested("whyChooseUs", { items: copy });
              }} />
              <div className="flex items-end gap-2">
                <Input label="Order" type="number" value={String(item.order ?? 0)} onChange={(e) => {
                  const copy = [...(form.whyChooseUs.items || [])];
                  copy[idx] = { ...copy[idx], order: Number(e.target.value || 0) };
                  updateNested("whyChooseUs", { items: copy });
                }} />
                <Button type="button" variant="ghost" size="sm" onClick={() => {
                  const copy = [...(form.whyChooseUs.items || [])];
                  copy.splice(idx, 1);
                  updateNested("whyChooseUs", { items: copy });
                }}>Remove</Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">About Preview</h2>
        <label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={Boolean(form.aboutPreview.isActive)} onChange={(e) => updateNested("aboutPreview", { isActive: e.target.checked })} />Section active</label>
        <Input label="Eyebrow" value={form.aboutPreview.eyebrow || ""} onChange={(e) => updateNested("aboutPreview", { eyebrow: e.target.value })} />
        <Input label="Title" value={form.aboutPreview.title || ""} onChange={(e) => updateNested("aboutPreview", { title: e.target.value })} />
        <Textarea label="Description" rows={3} value={form.aboutPreview.description || ""} onChange={(e) => updateNested("aboutPreview", { description: e.target.value })} />
        <Input label="Button text" value={form.aboutPreview.buttonText || ""} onChange={(e) => updateNested("aboutPreview", { buttonText: e.target.value })} />
        <Input label="Button URL" value={form.aboutPreview.buttonUrl || ""} onChange={(e) => updateNested("aboutPreview", { buttonUrl: e.target.value })} />
        <AdminMediaUploader label="About image" value={form.aboutPreview.image} folder={MEDIA_UPLOAD_FOLDERS.general.replace("/general", "/home")} usage="home-about" mediaType="image" onChange={(asset) => updateNested("aboutPreview", { image: asset || undefined })} />
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">Vision / Mission / Values</h2>
        <label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={Boolean(form.visionMission.isActive)} onChange={(e) => updateNested("visionMission", { isActive: e.target.checked })} />Section active</label>
        <Input label="Eyebrow" value={form.visionMission.eyebrow || ""} onChange={(e) => updateNested("visionMission", { eyebrow: e.target.value })} />
        <Input label="Title" value={form.visionMission.title || ""} onChange={(e) => updateNested("visionMission", { title: e.target.value })} />
        <Input label="Vision title" value={form.visionMission.visionTitle || ""} onChange={(e) => updateNested("visionMission", { visionTitle: e.target.value })} />
        <Textarea label="Vision description" rows={2} value={form.visionMission.visionDescription || ""} onChange={(e) => updateNested("visionMission", { visionDescription: e.target.value })} />
        <Input label="Mission title" value={form.visionMission.missionTitle || ""} onChange={(e) => updateNested("visionMission", { missionTitle: e.target.value })} />
        <Textarea label="Mission description" rows={2} value={form.visionMission.missionDescription || ""} onChange={(e) => updateNested("visionMission", { missionDescription: e.target.value })} />
        <Input label="Values title" value={form.visionMission.valuesTitle || ""} onChange={(e) => updateNested("visionMission", { valuesTitle: e.target.value })} />
        <Textarea label="Values description" rows={2} value={form.visionMission.valuesDescription || ""} onChange={(e) => updateNested("visionMission", { valuesDescription: e.target.value })} />
        <AdminMediaUploader label="Section image" value={form.visionMission.image} folder={MEDIA_UPLOAD_FOLDERS.general.replace("/general", "/home")} usage="home-vision-mission" mediaType="image" onChange={(asset) => updateNested("visionMission", { image: asset || undefined })} />
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">Stats</h2>
        <label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={Boolean(form.stats.isActive)} onChange={(e) => updateNested("stats", { isActive: e.target.checked })} />Section active</label>
        <Input label="Title" value={form.stats.title || ""} onChange={(e) => updateNested("stats", { title: e.target.value })} />
        <Textarea label="Description" rows={2} value={form.stats.description || ""} onChange={(e) => updateNested("stats", { description: e.target.value })} />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Stat items</h3>
            <Button type="button" size="sm" variant="outline" onClick={() => updateNested("stats", { items: [...(form.stats.items || []), { label: "", value: "", suffix: "", description: "", order: 0 }] })}>Add stat</Button>
          </div>
          {(form.stats.items || []).map((item, idx) => (
            <div key={`stat-${idx}`} className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-2">
              <Input label="Label" value={item.label || ""} onChange={(e) => {
                const copy = [...(form.stats.items || [])];
                copy[idx] = { ...copy[idx], label: e.target.value };
                updateNested("stats", { items: copy });
              }} />
              <Input label="Value" value={item.value || ""} onChange={(e) => {
                const copy = [...(form.stats.items || [])];
                copy[idx] = { ...copy[idx], value: e.target.value };
                updateNested("stats", { items: copy });
              }} />
              <Input label="Suffix" value={item.suffix || ""} onChange={(e) => {
                const copy = [...(form.stats.items || [])];
                copy[idx] = { ...copy[idx], suffix: e.target.value };
                updateNested("stats", { items: copy });
              }} />
              <Input label="Order" type="number" value={String(item.order ?? 0)} onChange={(e) => {
                const copy = [...(form.stats.items || [])];
                copy[idx] = { ...copy[idx], order: Number(e.target.value || 0) };
                updateNested("stats", { items: copy });
              }} />
              <Textarea label="Description" rows={2} value={item.description || ""} onChange={(e) => {
                const copy = [...(form.stats.items || [])];
                copy[idx] = { ...copy[idx], description: e.target.value };
                updateNested("stats", { items: copy });
              }} />
              <div className="flex items-end">
                <Button type="button" variant="ghost" size="sm" onClick={() => {
                  const copy = [...(form.stats.items || [])];
                  copy.splice(idx, 1);
                  updateNested("stats", { items: copy });
                }}>Remove</Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">Featured Projects</h2>
        <label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={Boolean(form.featuredProjects.isActive)} onChange={(e) => updateNested("featuredProjects", { isActive: e.target.checked })} />Section active</label>
        <Input label="Title" value={form.featuredProjects.title || ""} onChange={(e) => updateNested("featuredProjects", { title: e.target.value })} />
        <Input label="Subtitle" value={form.featuredProjects.subtitle || ""} onChange={(e) => updateNested("featuredProjects", { subtitle: e.target.value })} />
        <Textarea label="Description" rows={3} value={form.featuredProjects.description || ""} onChange={(e) => updateNested("featuredProjects", { description: e.target.value })} />
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">Selected Projects</span>
          <select
            multiple
            className="min-h-32 rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={form.featuredProjects.projectIds || []}
            onChange={(e) =>
              updateNested("featuredProjects", {
                projectIds: Array.from(e.target.selectedOptions).map((o) => o.value),
              })
            }
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">Industries We Serve</h2>
        <label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={Boolean(form.industries.isActive)} onChange={(e) => updateNested("industries", { isActive: e.target.checked })} />Section active</label>
        <Input label="Title" value={form.industries.title || ""} onChange={(e) => updateNested("industries", { title: e.target.value })} />
        <Textarea label="Description" rows={3} value={form.industries.description || ""} onChange={(e) => updateNested("industries", { description: e.target.value })} />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Industry items</h3>
            <Button type="button" size="sm" variant="outline" onClick={() => updateNested("industries", { items: [...(form.industries.items || []), { name: "", description: "", icon: "", order: 0 }] })}>Add industry</Button>
          </div>
          {(form.industries.items || []).map((item, idx) => (
            <div key={`industry-${idx}`} className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-2">
              <Input label="Name" value={item.name || ""} onChange={(e) => {
                const copy = [...(form.industries.items || [])];
                copy[idx] = { ...copy[idx], name: e.target.value };
                updateNested("industries", { items: copy });
              }} />
              <Input label="Icon" value={item.icon || ""} onChange={(e) => {
                const copy = [...(form.industries.items || [])];
                copy[idx] = { ...copy[idx], icon: e.target.value };
                updateNested("industries", { items: copy });
              }} />
              <Textarea label="Description" rows={2} value={item.description || ""} onChange={(e) => {
                const copy = [...(form.industries.items || [])];
                copy[idx] = { ...copy[idx], description: e.target.value };
                updateNested("industries", { items: copy });
              }} />
              <div className="flex items-end gap-2">
                <Input label="Order" type="number" value={String(item.order ?? 0)} onChange={(e) => {
                  const copy = [...(form.industries.items || [])];
                  copy[idx] = { ...copy[idx], order: Number(e.target.value || 0) };
                  updateNested("industries", { items: copy });
                }} />
                <Button type="button" variant="ghost" size="sm" onClick={() => {
                  const copy = [...(form.industries.items || [])];
                  copy.splice(idx, 1);
                  updateNested("industries", { items: copy });
                }}>Remove</Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">Team Preview</h2>
        <label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={Boolean(form.teamPreview.isActive)} onChange={(e) => updateNested("teamPreview", { isActive: e.target.checked })} />Section active</label>
        <Input label="Title" value={form.teamPreview.title || ""} onChange={(e) => updateNested("teamPreview", { title: e.target.value })} />
        <Textarea label="Description" rows={2} value={form.teamPreview.description || ""} onChange={(e) => updateNested("teamPreview", { description: e.target.value })} />
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">Clients</h2>
        <label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={Boolean(form.clients.isActive)} onChange={(e) => updateNested("clients", { isActive: e.target.checked })} />Section active</label>
        <Input label="Title" value={form.clients.title || ""} onChange={(e) => updateNested("clients", { title: e.target.value })} />
        <Textarea label="Description" rows={2} value={form.clients.description || ""} onChange={(e) => updateNested("clients", { description: e.target.value })} />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Client logos</h3>
            <Button type="button" size="sm" variant="outline" onClick={() => updateNested("clients", { logos: [...(form.clients.logos || []), { name: "", url: "", order: 0 }] })}>Add logo</Button>
          </div>
          {(form.clients.logos || []).map((logo, idx) => (
            <div key={`logo-${idx}`} className="space-y-2 rounded-md border border-border p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <Input label="Name" value={logo.name || ""} onChange={(e) => {
                  const copy = [...(form.clients.logos || [])];
                  copy[idx] = { ...copy[idx], name: e.target.value };
                  updateNested("clients", { logos: copy });
                }} />
                <Input label="URL" value={logo.url || ""} onChange={(e) => {
                  const copy = [...(form.clients.logos || [])];
                  copy[idx] = { ...copy[idx], url: e.target.value };
                  updateNested("clients", { logos: copy });
                }} />
              </div>
              <Input label="Order" type="number" value={String(logo.order ?? 0)} onChange={(e) => {
                const copy = [...(form.clients.logos || [])];
                copy[idx] = { ...copy[idx], order: Number(e.target.value || 0) };
                updateNested("clients", { logos: copy });
              }} />
              <AdminMediaUploader
                label="Logo image"
                value={logo.logo}
                folder={MEDIA_UPLOAD_FOLDERS.general.replace("/general", "/home")}
                usage="home-client-logo"
                mediaType="image"
                onChange={(asset) => {
                  const copy = [...(form.clients.logos || [])];
                  copy[idx] = { ...copy[idx], logo: asset || undefined };
                  updateNested("clients", { logos: copy });
                }}
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => {
                const copy = [...(form.clients.logos || [])];
                copy.splice(idx, 1);
                updateNested("clients", { logos: copy });
              }}>Remove</Button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">Profile CTA</h2>
        <label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={Boolean(form.profileCTA.isActive)} onChange={(e) => updateNested("profileCTA", { isActive: e.target.checked })} />Section active</label>
        <Input label="Eyebrow" value={form.profileCTA.eyebrow || ""} onChange={(e) => updateNested("profileCTA", { eyebrow: e.target.value })} />
        <Input label="Title" value={form.profileCTA.title || ""} onChange={(e) => updateNested("profileCTA", { title: e.target.value })} />
        <Textarea label="Description" rows={2} value={form.profileCTA.description || ""} onChange={(e) => updateNested("profileCTA", { description: e.target.value })} />
        <Input label="Button text" value={form.profileCTA.buttonText || ""} onChange={(e) => updateNested("profileCTA", { buttonText: e.target.value })} />
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">Contact CTA</h2>
        <label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={Boolean(form.contactCTA.isActive)} onChange={(e) => updateNested("contactCTA", { isActive: e.target.checked })} />Section active</label>
        <Input label="Eyebrow" value={form.contactCTA.eyebrow || ""} onChange={(e) => updateNested("contactCTA", { eyebrow: e.target.value })} />
        <Input label="Title" value={form.contactCTA.title || ""} onChange={(e) => updateNested("contactCTA", { title: e.target.value })} />
        <Textarea label="Description" rows={2} value={form.contactCTA.description || ""} onChange={(e) => updateNested("contactCTA", { description: e.target.value })} />
        <Input label="Button text" value={form.contactCTA.buttonText || ""} onChange={(e) => updateNested("contactCTA", { buttonText: e.target.value })} />
        <Input label="Button URL" value={form.contactCTA.buttonUrl || ""} onChange={(e) => updateNested("contactCTA", { buttonUrl: e.target.value })} />
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">SEO</h2>
        <Input label="Meta title" value={form.seo.metaTitle || ""} onChange={(e) => setPath("seo", { ...form.seo, metaTitle: e.target.value })} />
        <Textarea label="Meta description" rows={3} value={form.seo.metaDescription || ""} onChange={(e) => setPath("seo", { ...form.seo, metaDescription: e.target.value })} />
        <Textarea label="Keywords CSV" rows={2} value={keywordsCsv} onChange={(e) => setKeywordsCsv(e.target.value)} />
        <Input label="Canonical URL" value={form.seo.canonicalUrl || ""} onChange={(e) => setPath("seo", { ...form.seo, canonicalUrl: e.target.value })} />
        <Input label="OG title" value={form.seo.ogTitle || ""} onChange={(e) => setPath("seo", { ...form.seo, ogTitle: e.target.value })} />
        <Textarea label="OG description" rows={3} value={form.seo.ogDescription || ""} onChange={(e) => setPath("seo", { ...form.seo, ogDescription: e.target.value })} />
        <AdminMediaUploader
          label="OG image"
          value={typeof form.seo.ogImage === "object" ? form.seo.ogImage : undefined}
          folder={MEDIA_UPLOAD_FOLDERS.seo}
          usage="home-og"
          mediaType="image"
          onChange={(asset) => setPath("seo", { ...form.seo, ogImage: asset || undefined })}
        />
        <div className="flex flex-wrap gap-6 text-sm">
          <label className="flex items-center gap-2 text-muted-foreground">
            <input
              type="checkbox"
              checked={form.seo.robots?.index ?? true}
              onChange={(e) =>
                setPath("seo", {
                  ...form.seo,
                  robots: {
                    index: e.target.checked,
                    follow: form.seo.robots?.follow ?? true,
                  },
                })
              }
            />
            Robots index
          </label>
          <label className="flex items-center gap-2 text-muted-foreground">
            <input
              type="checkbox"
              checked={form.seo.robots?.follow ?? true}
              onChange={(e) =>
                setPath("seo", {
                  ...form.seo,
                  robots: {
                    index: form.seo.robots?.index ?? true,
                    follow: e.target.checked,
                  },
                })
              }
            />
            Robots follow
          </label>
        </div>
        <Input label="Schema type" value={form.seo.schemaType || "WebSite"} onChange={(e) => setPath("seo", { ...form.seo, schemaType: e.target.value })} />
      </section>

      <div className="sticky bottom-0 z-20 border-t border-border bg-background/95 py-4 backdrop-blur">
        <Button type="submit" isLoading={saving} disabled={saving}>
          Save Home Page
        </Button>
      </div>
    </form>
  );
}

