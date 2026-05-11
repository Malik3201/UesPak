"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { TeamMemberDto, TeamMemberStatus } from "@/types/team";
import type { MediaObject } from "@/types/media";
import { Input } from "@/components/shared/Input";
import Textarea from "@/components/shared/Textarea";
import { Button } from "@/components/shared/Button";
import AdminMediaUploader from "@/components/admin/media/AdminMediaUploader";
import { MEDIA_UPLOAD_FOLDERS } from "@/constants/media-folders";
import { generateSlug } from "@/lib/slug";

type FormMode = "create" | "edit";

const defaultMember: Partial<TeamMemberDto> = {
  name: "",
  slug: "",
  designation: "",
  department: "",
  shortBio: "",
  bio: "",
  expertise: [],
  qualifications: [],
  experienceYears: undefined,
  email: "",
  phone: "",
  linkedinUrl: "",
  socialLinks: [],
  status: "draft",
  order: 0,
  isFeatured: false,
  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: [],
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    robots: { index: true, follow: true },
    schemaType: "Person",
  },
};

interface TeamMemberFormProps {
  mode: FormMode;
  initialMember?: Partial<TeamMemberDto>;
}

export default function TeamMemberForm({
  mode,
  initialMember,
}: TeamMemberFormProps) {
  const router = useRouter();
  const merged = useMemo(
    () => ({
      ...defaultMember,
      ...initialMember,
      expertise: initialMember?.expertise ?? [],
      qualifications: initialMember?.qualifications ?? [],
      socialLinks: initialMember?.socialLinks ?? [],
      seo: {
        ...defaultMember.seo,
        ...initialMember?.seo,
        robots: {
          index: initialMember?.seo?.robots?.index ?? true,
          follow: initialMember?.seo?.robots?.follow ?? true,
        },
      },
    }),
    [initialMember]
  );

  const [form, setForm] = useState(merged);
  const [keywordsCsv, setKeywordsCsv] = useState(
    (initialMember?.seo?.keywords ?? []).join(", ")
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log(
        "[TEAM SEO DEBUG] loaded teamMember.seo into form:",
        initialMember?.seo
      );
    }
  }, [initialMember?.seo]);

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

    if (process.env.NODE_ENV === "development") {
      console.log("[TEAM DEBUG] SAVE mode:", mode);
      console.log("[TEAM DEBUG] SAVE payload.shortBio:", body.shortBio);
      console.log(
        "[TEAM DEBUG] SAVE payload.bio length:",
        body.bio ? body.bio.length : 0
      );
      console.log("[TEAM DEBUG] SAVE payload.expertise:", body.expertise);
      console.log(
        "[TEAM DEBUG] SAVE payload.qualifications:",
        body.qualifications
      );
      console.log("[TEAM DEBUG] SAVE payload.email:", body.email);
      console.log(
        "[TEAM DEBUG] SAVE payload.experienceYears:",
        body.experienceYears
      );
      console.log("[TEAM DEBUG] SAVE payload.seo:", body.seo);
      console.log("[TEAM SEO DEBUG] FORM payload.seo:", body.seo);
      console.log("[TEAM DEBUG] SAVE payload.image:", body.image);
    }

    const url =
      mode === "create"
        ? "/api/admin/team"
        : `/api/admin/team/${initialMember?.id}`;
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
        throw new Error(json?.message || "Failed to save team member.");
      }
      const member = json?.data?.teamMember as TeamMemberDto | undefined;

      if (process.env.NODE_ENV === "development") {
        console.log("[TEAM DEBUG] SAVE response shortBio:", member?.shortBio);
        console.log("[TEAM DEBUG] SAVE response expertise:", member?.expertise);
        console.log(
          "[TEAM DEBUG] SAVE response qualifications:",
          member?.qualifications
        );
        console.log("[TEAM DEBUG] SAVE response seo:", member?.seo);
        console.log("[TEAM SEO DEBUG] FORM response teamMember.seo:", member?.seo);
        console.log("[TEAM DEBUG] SAVE response image:", member?.image);
      }

      setMessage(
        mode === "create"
          ? "Team member created successfully."
          : "Team member saved successfully."
      );
      if (mode === "create" && member?.id) {
        router.replace(`/admin/team/${member.id}`);
      } else if (member) {
        // Rehydrate the entire form from the authoritative server response so
        // the UI shows exactly what was persisted (not what the user typed).
        // This is the same defense-in-depth pattern we used for HomePage CMS:
        // if the API silently dropped a field, the form will reveal it
        // immediately instead of waiting for the user to refresh the browser.
        setForm({
          ...defaultMember,
          ...member,
          expertise: member.expertise ?? [],
          qualifications: member.qualifications ?? [],
          socialLinks: member.socialLinks ?? [],
          seo: {
            ...defaultMember.seo,
            ...member.seo,
            robots: {
              index: member.seo?.robots?.index ?? true,
              follow: member.seo?.robots?.follow ?? true,
            },
          },
        });
        setKeywordsCsv((member.seo?.keywords ?? []).join(", "));
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
        <Input
          label="Designation"
          required
          value={form.designation || ""}
          onChange={(e) => update("designation", e.target.value)}
          hint="e.g. Project Engineer, Operations Lead"
        />
        <Input
          label="Department"
          value={form.department || ""}
          onChange={(e) => update("department", e.target.value)}
          hint="Optional team / department label"
        />
        <Textarea
          label="Short bio"
          rows={2}
          value={form.shortBio || ""}
          onChange={(e) => update("shortBio", e.target.value)}
          hint="One or two sentences displayed on team cards (max 400 chars)."
        />
        <Textarea
          label="Full bio"
          rows={6}
          value={form.bio || ""}
          onChange={(e) => update("bio", e.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-foreground">Status</span>
            <select
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
              value={form.status || "draft"}
              onChange={(e) =>
                update("status", e.target.value as TeamMemberStatus)
              }
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
            Featured on homepage
          </label>
        </div>
        <Input
          label="Years of experience"
          type="number"
          value={
            form.experienceYears !== undefined && form.experienceYears !== null
              ? String(form.experienceYears)
              : ""
          }
          onChange={(e) =>
            update(
              "experienceYears",
              e.target.value === "" ? undefined : Number(e.target.value)
            )
          }
        />
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">
          Profile Image
        </h2>
        <AdminMediaUploader
          label="Profile photo"
          value={form.image}
          folder={MEDIA_UPLOAD_FOLDERS.team}
          usage="team-profile"
          mediaType="image"
          helperText="Square or portrait photos work best."
          onChange={(asset) => update("image", (asset as MediaObject) || undefined)}
        />
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Expertise</h2>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => update("expertise", [...(form.expertise ?? []), ""])}
          >
            Add expertise
          </Button>
        </div>
        {(form.expertise ?? []).map((item, idx) => (
          <div key={`expertise-${idx}`} className="flex items-center gap-2">
            <Input
              className="flex-1"
              value={item}
              onChange={(e) => {
                const copy = [...(form.expertise ?? [])];
                copy[idx] = e.target.value;
                update("expertise", copy);
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                const copy = [...(form.expertise ?? [])];
                copy.splice(idx, 1);
                update("expertise", copy);
              }}
            >
              Remove
            </Button>
          </div>
        ))}
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Qualifications
          </h2>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              update("qualifications", [...(form.qualifications ?? []), ""])
            }
          >
            Add qualification
          </Button>
        </div>
        {(form.qualifications ?? []).map((item, idx) => (
          <div key={`qualification-${idx}`} className="flex items-center gap-2">
            <Input
              className="flex-1"
              value={item}
              onChange={(e) => {
                const copy = [...(form.qualifications ?? [])];
                copy[idx] = e.target.value;
                update("qualifications", copy);
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                const copy = [...(form.qualifications ?? [])];
                copy.splice(idx, 1);
                update("qualifications", copy);
              }}
            >
              Remove
            </Button>
          </div>
        ))}
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">
          Contact & Social
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Email"
            type="email"
            value={form.email || ""}
            onChange={(e) => update("email", e.target.value)}
          />
          <Input
            label="Phone"
            value={form.phone || ""}
            onChange={(e) => update("phone", e.target.value)}
          />
        </div>
        <Input
          label="LinkedIn URL"
          value={form.linkedinUrl || ""}
          onChange={(e) => update("linkedinUrl", e.target.value)}
          placeholder="https://www.linkedin.com/in/..."
        />
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Additional social links</h3>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                update("socialLinks", [
                  ...(form.socialLinks ?? []),
                  { label: "", url: "" },
                ])
              }
            >
              Add link
            </Button>
          </div>
          {(form.socialLinks ?? []).map((link, idx) => (
            <div
              key={`social-${idx}`}
              className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-[160px_1fr_auto]"
            >
              <Input
                placeholder="Label (e.g., Twitter)"
                value={link.label}
                onChange={(e) => {
                  const copy = [...(form.socialLinks ?? [])];
                  copy[idx] = { ...copy[idx], label: e.target.value };
                  update("socialLinks", copy);
                }}
              />
              <Input
                placeholder="https://..."
                value={link.url}
                onChange={(e) => {
                  const copy = [...(form.socialLinks ?? [])];
                  copy[idx] = { ...copy[idx], url: e.target.value };
                  update("socialLinks", copy);
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  const copy = [...(form.socialLinks ?? [])];
                  copy.splice(idx, 1);
                  update("socialLinks", copy);
                }}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">SEO</h2>
        <Input
          label="Meta title"
          value={form.seo?.metaTitle || ""}
          onChange={(e) =>
            update("seo", { ...(form.seo ?? {}), metaTitle: e.target.value })
          }
        />
        <Textarea
          label="Meta description"
          rows={3}
          value={form.seo?.metaDescription || ""}
          onChange={(e) =>
            update("seo", {
              ...(form.seo ?? {}),
              metaDescription: e.target.value,
            })
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
          onChange={(e) =>
            update("seo", {
              ...(form.seo ?? {}),
              canonicalUrl: e.target.value,
            })
          }
        />
        <Input
          label="OG title"
          value={form.seo?.ogTitle || ""}
          onChange={(e) =>
            update("seo", { ...(form.seo ?? {}), ogTitle: e.target.value })
          }
        />
        <Textarea
          label="OG description"
          rows={3}
          value={form.seo?.ogDescription || ""}
          onChange={(e) =>
            update("seo", {
              ...(form.seo ?? {}),
              ogDescription: e.target.value,
            })
          }
        />
        <AdminMediaUploader
          label="OG image"
          value={typeof form.seo?.ogImage === "object" ? form.seo.ogImage : undefined}
          folder={MEDIA_UPLOAD_FOLDERS.seo}
          usage="team-og"
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
          value={form.seo?.schemaType || "Person"}
          onChange={(e) =>
            update("seo", { ...(form.seo ?? {}), schemaType: e.target.value })
          }
        />
      </section>

      <div className="sticky bottom-0 z-20 border-t border-border bg-background/95 py-4 backdrop-blur">
        <Button type="submit" isLoading={saving} disabled={saving}>
          {mode === "create" ? "Create Team Member" : "Save Team Member"}
        </Button>
      </div>
    </form>
  );
}
