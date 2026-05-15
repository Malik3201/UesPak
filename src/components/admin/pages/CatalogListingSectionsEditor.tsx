"use client";

import Input from "@/components/shared/Input";
import Textarea from "@/components/shared/Textarea";
import AdminMediaUploader from "@/components/admin/media/AdminMediaUploader";
import { MEDIA_UPLOAD_FOLDERS } from "@/constants/media-folders";
import type {
  CatalogListingPageSections,
  GroupPageHeroSettings,
  ProjectsPageSections,
  ServicesPageSections,
} from "@/types/page-content";
import type { MediaObject } from "@/types/media";

type MediaAssetInput = Partial<MediaObject> & { filePath?: string };

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

function GroupHeroFieldsEditor({
  label,
  value,
  usage,
  onChange,
}: {
  label: string;
  value: GroupPageHeroSettings;
  usage: string;
  onChange: (next: GroupPageHeroSettings) => void;
}) {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
      <h4 className="text-sm font-semibold text-foreground">{label}</h4>
      <Input
        label="Hero title"
        value={value.title || ""}
        onChange={(e) => onChange({ ...value, title: e.target.value })}
      />
      <Textarea
        label="Hero description"
        rows={3}
        value={value.description || ""}
        onChange={(e) => onChange({ ...value, description: e.target.value })}
      />
      <AdminMediaUploader
        label="Group hero background image"
        value={value.backgroundImage}
        folder={MEDIA_UPLOAD_FOLDERS.pages}
        usage={usage}
        mediaType="image"
        helperText="Used only on this group listing page. Falls back to main page hero if empty."
        onChange={(asset) =>
          onChange({ ...value, backgroundImage: normalizeMediaAsset(asset) })
        }
      />
      <Input
        label="Overlay opacity (0–100%)"
        type="number"
        min={0}
        max={100}
        value={Math.round((value.overlayOpacity ?? 0.88) * 100)}
        onChange={(e) => {
          const pct = Math.min(100, Math.max(0, Number(e.target.value) || 0));
          onChange({ ...value, overlayOpacity: pct / 100 });
        }}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="SEO title (optional)"
          maxLength={70}
          value={value.metaTitle || ""}
          onChange={(e) => onChange({ ...value, metaTitle: e.target.value })}
        />
        <Textarea
          label="SEO description (optional)"
          rows={2}
          maxLength={180}
          value={value.metaDescription || ""}
          onChange={(e) => onChange({ ...value, metaDescription: e.target.value })}
        />
      </div>
    </div>
  );
}

function CatalogListingIntroCtaFields<T extends CatalogListingPageSections>({
  pageKey,
  sections,
  onChange,
}: {
  pageKey: "services" | "projects";
  sections: T;
  onChange: (sections: T) => void;
}) {
  const s = sections;
  const update = (patch: Partial<CatalogListingPageSections>) =>
    onChange({ ...s, ...patch } as T);

  return (
    <>
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
    </>
  );
}

export function ServicesListingSectionsEditor({
  sections,
  onChange,
}: {
  sections: ServicesPageSections;
  onChange: (sections: ServicesPageSections) => void;
}) {
  const s = sections;
  const groups = s.serviceGroups || { engineering: {}, agriculture: {} };

  return (
    <section className="space-y-5 rounded-xl border border-border bg-card p-5">
      <h2 className="text-base font-semibold text-foreground">Services Listing Page</h2>
      <CatalogListingIntroCtaFields pageKey="services" sections={s} onChange={onChange} />

      <div className="space-y-4 rounded-lg border border-border p-4">
        <h3 className="text-sm font-semibold">Service Group Pages</h3>
        <p className="text-xs text-muted-foreground">
          Hero for /services/group/engineering and /services/group/agriculture.
        </p>
        <GroupHeroFieldsEditor
          label="Engineering Services"
          usage="services-engineering-group-hero"
          value={groups.engineering || {}}
          onChange={(engineering) =>
            onChange({ ...s, serviceGroups: { ...groups, engineering } })
          }
        />
        <GroupHeroFieldsEditor
          label="Agriculture Services"
          usage="services-agriculture-group-hero"
          value={groups.agriculture || {}}
          onChange={(agriculture) =>
            onChange({ ...s, serviceGroups: { ...groups, agriculture } })
          }
        />
      </div>
    </section>
  );
}

export function ProjectsListingSectionsEditor({
  sections,
  onChange,
}: {
  sections: ProjectsPageSections;
  onChange: (sections: ProjectsPageSections) => void;
}) {
  const s = sections;
  const groups = s.projectGroups || {
    engineering: {},
    agriculture: {},
    industrialAutomation: {},
  };

  return (
    <section className="space-y-5 rounded-xl border border-border bg-card p-5">
      <h2 className="text-base font-semibold text-foreground">Projects Listing Page</h2>
      <CatalogListingIntroCtaFields pageKey="projects" sections={s} onChange={onChange} />

      <div className="space-y-4 rounded-lg border border-border p-4">
        <h3 className="text-sm font-semibold">Project Group Pages</h3>
        <p className="text-xs text-muted-foreground">
          Hero for each /projects/group/... route.
        </p>
        <GroupHeroFieldsEditor
          label="Engineering Projects"
          usage="projects-engineering-group-hero"
          value={groups.engineering || {}}
          onChange={(engineering) =>
            onChange({ ...s, projectGroups: { ...groups, engineering } })
          }
        />
        <GroupHeroFieldsEditor
          label="Agriculture Projects"
          usage="projects-agriculture-group-hero"
          value={groups.agriculture || {}}
          onChange={(agriculture) =>
            onChange({ ...s, projectGroups: { ...groups, agriculture } })
          }
        />
        <GroupHeroFieldsEditor
          label="Industrial Automation"
          usage="projects-industrial-automation-group-hero"
          value={groups.industrialAutomation || {}}
          onChange={(industrialAutomation) =>
            onChange({ ...s, projectGroups: { ...groups, industrialAutomation } })
          }
        />
      </div>
    </section>
  );
}
