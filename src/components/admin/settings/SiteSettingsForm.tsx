"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import type { SiteSettingsDTO } from "@/types/site-settings";
import {
  cloneDefaultSiteSettings,
  siteSettingsDtoToForm,
} from "@/constants/default-site-settings";
import { siteSettingsSchema } from "@/validators/settings.validator";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import Textarea from "@/components/shared/Textarea";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

const isBrowserDev =
  typeof process !== "undefined" && process.env.NODE_ENV === "development";

function splitKeywords(csv: string): string[] {
  return csv
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)
    .slice(0, 80);
}

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
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
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

export default function SiteSettingsForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [keywordsCsv, setKeywordsCsv] = useState("");
  const [banner, setBanner] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );
  const [fieldErrorsJson, setFieldErrorsJson] = useState<string | null>(null);

  const form = useForm<SiteSettingsDTO>({
    defaultValues: siteSettingsDtoToForm(cloneDefaultSiteSettings()),
  });

  const { control, handleSubmit, register, reset } = form;

  const phones = useFieldArray({ control, name: "phones" });
  const emails = useFieldArray({ control, name: "emails" });
  const socialLinks = useFieldArray({ control, name: "socialLinks" });

  const applyDto = useCallback((dto: SiteSettingsDTO) => {
    reset(siteSettingsDtoToForm(dto));
    setKeywordsCsv((dto.seo.keywords ?? []).join(", "));
    setFieldErrorsJson(null);
  }, [reset]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setBanner(null);
      try {
        const res = await fetch("/api/admin/settings", {
          method: "GET",
          credentials: "include",
        });
        const json = await res.json().catch(() => null);
        if (!res.ok) {
          if (res.status === 401) {
            router.replace("/admin/login");
            return;
          }
          throw new Error(json?.message ?? "Failed to load settings.");
        }
        const dto = json?.data?.settings as SiteSettingsDTO | undefined;
        if (!cancelled && dto) applyDto(dto);
      } catch (e) {
        if (!cancelled) {
          setBanner({
            type: "err",
            text:
              e instanceof Error ? e.message : "Unable to load site settings.",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [applyDto, router]);

  async function onSubmit(raw: SiteSettingsDTO) {
    setSaving(true);
    setBanner(null);
    setFieldErrorsJson(null);

    const payload: SiteSettingsDTO = {
      ...raw,
      phones: (raw.phones ?? []).filter((p) => p.value?.trim()),
      emails: (raw.emails ?? []).filter((e) => e.value?.trim()),
      socialLinks: (raw.socialLinks ?? [])
        .filter((s) => s.platform?.trim() && s.url?.trim())
        .map((s, i) => ({
          ...s,
          platform: s.platform.trim(),
          url: s.url.trim(),
          order: typeof s.order === "number" ? s.order : i,
        }))
        .map((s, i) => ({ ...s, order: i })),
      seo: {
        ...raw.seo,
        keywords: splitKeywords(keywordsCsv),
      },
    };

    const parsed = siteSettingsSchema.safeParse(payload);
    if (!parsed.success) {
      setFieldErrorsJson(
        JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)
      );
      setBanner({
        type: "err",
        text: "Please fix validation errors below.",
      });
      setSaving(false);
      return;
    }

    const bodyPayload = parsed.data;

    if (isBrowserDev) {
      console.debug(
        "[SiteSettingsForm] PATCH body keys:",
        Object.keys(bodyPayload as Record<string, unknown>)
      );
    }

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(bodyPayload),
      });
      const json = await res.json().catch(() => null);

      if (!res.ok || json?.success !== true) {
        if (res.status === 401) {
          router.replace("/admin/login");
          return;
        }
        if (res.status === 422 && json?.errors != null) {
          setFieldErrorsJson(
            typeof json.errors === "string"
              ? json.errors
              : JSON.stringify(json.errors, null, 2)
          );
          setBanner({
            type: "err",
            text:
              typeof json.message === "string"
                ? json.message
                : "Validation failed. Please check your input.",
          });
          setSaving(false);
          return;
        }
        throw new Error(
          typeof json?.message === "string"
            ? json.message
            : "Failed to save settings."
        );
      }

      const dto = json?.data?.settings as SiteSettingsDTO | undefined;
      if (dto) applyDto(dto);
      setBanner({ type: "ok", text: "Settings saved successfully." });
      router.refresh();
    } catch (e) {
      setBanner({
        type: "err",
        text:
          e instanceof Error ? e.message : "Unable to save site settings.",
      });
    } finally {
      setSaving(false);
    }
  }

  const toolbar = (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="submit" variant="primary" isLoading={saving} disabled={saving}>
        {saving ? "Saving..." : "Save settings"}
      </Button>
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size="lg" label="Loading site settings..." />
      </div>
    );
  }

  return (
    <form
      id="site-settings-form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 pb-28"
    >
      <div className="sticky top-0 z-40 space-y-3 border-b border-border bg-background/95 pb-4 pt-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        {banner?.type === "ok" ? (
          <div
            className="rounded-md border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary"
            role="status"
          >
            {banner.text}
          </div>
        ) : null}
        {banner?.type === "err" ? (
          <div
            className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {banner.text}
          </div>
        ) : null}
        {fieldErrorsJson ? (
          <details className="rounded-md border border-border bg-muted/40 px-4 py-2 text-xs">
            <summary className="cursor-pointer font-medium">
              Validation details (server/client)
            </summary>
            <pre className="mt-2 whitespace-pre-wrap break-words text-muted-foreground">
              {fieldErrorsJson}
            </pre>
          </details>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {toolbar}
        </div>
      </div>

      <Section
        title="Brand"
        description="Site identity and core assets (URLs — uploads come later)."
      >
        <Input
          label="Site name"
          required
          {...register("siteName")}
        />
        <Input label="Tagline" {...register("tagline")} />
        <Input
          label="Logo URL"
          hint="HTTPS or site-relative path (starts with /). Cloudinary HTTPS preferred."
          {...register("logo.url")}
        />
        <Input label="Logo alt text" {...register("logo.altText")} />
        <Input label="Dark logo URL" {...register("darkLogo.url")} />
        <Input label="Dark logo alt text" {...register("darkLogo.altText")} />
        <Input label="Favicon URL" {...register("favicon.url")} />
      </Section>

      <Section
        title="Contact"
        description="Shown in header, footer, and contact-rich areas."
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold text-foreground">Phones</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                phones.append({ label: "", value: "", isPrimary: false })
              }
            >
              Add phone
            </Button>
          </div>
          {phones.fields.map((field, idx) => (
            <div
              key={field.id}
              className="flex flex-col gap-2 rounded-md border border-border p-4 sm:flex-row sm:items-start"
            >
              <Input
                className="flex-1"
                label={`Label ${idx + 1}`}
                {...register(`phones.${idx}.label` as const)}
              />
              <Input
                className="flex-1"
                label="Number"
                required
                {...register(`phones.${idx}.value` as const)}
              />
              <label className="flex items-center gap-2 text-xs text-muted-foreground sm:mt-8">
                <input type="checkbox" {...register(`phones.${idx}.isPrimary` as const)} />{" "}
                Primary
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="sm:mt-6"
                onClick={() => phones.remove(idx)}
              >
                Remove
              </Button>
            </div>
          ))}
          {phones.fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">No phone rows yet.</p>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold text-foreground">Emails</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                emails.append({ label: "", value: "", isPrimary: false })
              }
            >
              Add email
            </Button>
          </div>
          {emails.fields.map((field, idx) => (
            <div
              key={field.id}
              className="flex flex-col gap-2 rounded-md border border-border p-4 sm:flex-row sm:items-start"
            >
              <Input
                className="flex-1"
                label={`Label ${idx + 1}`}
                {...register(`emails.${idx}.label` as const)}
              />
              <Input
                className="flex-1"
                label="Email"
                required
                {...register(`emails.${idx}.value` as const)}
              />
              <label className="flex items-center gap-2 text-xs text-muted-foreground sm:mt-8">
                <input
                  type="checkbox"
                  {...register(`emails.${idx}.isPrimary` as const)}
                />{" "}
                Primary
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="sm:mt-6"
                onClick={() => emails.remove(idx)}
              >
                Remove
              </Button>
            </div>
          ))}
          {emails.fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">No email rows yet.</p>
          ) : null}
        </div>

        <Textarea label="Address" rows={3} {...register("address")} />
        <Input label="Working hours" {...register("workingHours")} />
        <Input
          label="Google Maps embed URL (iframe src)"
          hint='Must start with http:// or https:// — paste the embed "src".'
          {...register("mapEmbedUrl")}
        />
      </Section>

      <Section
        title="Social links"
        description="Active rows appear in the footer; order controls display order via “Order”."
      >
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              socialLinks.append({
                platform: "",
                url: "",
                icon: "",
                isActive: true,
                order: socialLinks.fields.length,
              })
            }
          >
            Add social profile
          </Button>
        </div>
        {socialLinks.fields.map((field, idx) => (
          <div
            key={field.id}
            className="grid gap-3 rounded-md border border-border p-4 sm:grid-cols-2 lg:grid-cols-12"
          >
            <Input
              className="lg:col-span-3"
              label="Platform"
              {...register(`socialLinks.${idx}.platform` as const)}
            />
            <Input
              className="lg:col-span-5"
              label="URL"
              {...register(`socialLinks.${idx}.url` as const)}
            />
            <Input
              className="lg:col-span-2"
              label="Icon (optional slug)"
              {...register(`socialLinks.${idx}.icon` as const)}
            />
            <Input
              className="lg:col-span-1"
              label="Order"
              type="number"
              {...register(`socialLinks.${idx}.order` as const)}
            />
            <label className="flex flex-col gap-2 text-xs text-muted-foreground lg:col-span-1">
              <span>Active</span>
              <input
                type="checkbox"
                {...register(`socialLinks.${idx}.isActive` as const)}
              />
            </label>
            <div className="flex items-end lg:col-span-12">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => socialLinks.remove(idx)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
        {socialLinks.fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No social links yet — add LinkedIn/X/Facebook/etc.
          </p>
        ) : null}
      </Section>

      <Section
        title="Profile PDF"
        description="Adds a downloadable profile button in the public navbar."
      >
        <Input label="PDF URL (HTTPS)" {...register("profilePdf.url")} />
        <Input
          label="Button label"
          {...register("profileButtonText")}
          hint='Default: “Download Profile”'
        />
      </Section>

      <Section title="Footer" description="Supporting copy beneath main columns.">
        <Input label="Footer highlight line" {...register("footerText")} />
        <Textarea label="Footer description" rows={4} {...register("footerDescription")} />
        <Input label="Copyright text" {...register("copyrightText")} />
      </Section>

      <Section
        title="Global navbar CTA"
        description="Overrides the desktop “Get in Touch” destination when enabled."
      >
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" {...register("globalCTA.isActive")} /> CTA enabled
        </label>
        <Input label="CTA title" {...register("globalCTA.title")} />
        <Textarea rows={3} label="CTA description" {...register("globalCTA.description")} />
        <Input label="CTA button text" {...register("globalCTA.buttonText")} />
        <Input
          label="CTA button URL"
          {...register("globalCTA.buttonUrl")}
        />
      </Section>

      <Section
        title="SEO defaults"
        description="Fallback metadata when pages do not declare their own — merged at the root cautiously."
      >
        <Input label="Meta title" {...register("seo.metaTitle")} />
        <Textarea rows={4} label="Meta description" {...register("seo.metaDescription")} />
        <label className="flex flex-col gap-1 text-sm font-medium text-foreground" htmlFor="seo-keywords-csv">
          Keywords (comma separated)
          <textarea
            id="seo-keywords-csv"
            value={keywordsCsv}
            onChange={(e) => setKeywordsCsv(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="EPC, Pakistan, engineering"
          />
        </label>
        <Input label="Canonical URL (site-wide)" {...register("seo.canonicalUrl")} />
        <Input label="OG title" {...register("seo.ogTitle")} />
        <Textarea rows={3} label="OG description" {...register("seo.ogDescription")} />
        <Input label="OG image URL" {...register("seo.ogImage.url")} />
        <Input label="OG image alt" {...register("seo.ogImage.altText")} />
        <div className="flex flex-wrap gap-6 pt-2 text-sm">
          <label className="flex items-center gap-2 text-muted-foreground">
            <input type="checkbox" {...register("seo.robots.index")} /> Search engines may index (robots:index)
          </label>
          <label className="flex items-center gap-2 text-muted-foreground">
            <input type="checkbox" {...register("seo.robots.follow")} /> Follow links (robots:follow)
          </label>
        </div>
        <Input label="Schema.org type helper" {...register("seo.schemaType")} hint="Example: Organization" />
      </Section>

      <div className="sticky bottom-0 z-30 border-t border-border bg-background/90 py-4 backdrop-blur">
        <div className="flex flex-wrap gap-3">{toolbar}</div>
      </div>
    </form>
  );
}
