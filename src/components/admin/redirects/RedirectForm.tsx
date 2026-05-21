"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/shared/Input";
import Textarea from "@/components/shared/Textarea";
import { Button } from "@/components/shared/Button";
import type { RedirectDto, RedirectStatusCode } from "@/types/redirect";

type FormMode = "create" | "edit";

interface RedirectFormProps {
  mode: FormMode;
  initialRedirect?: Partial<RedirectDto>;
}

const STATUS_OPTIONS: RedirectStatusCode[] = [301, 302, 307, 308];

export default function RedirectForm({ mode, initialRedirect }: RedirectFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    fromPath: initialRedirect?.fromPath ?? "",
    toPath: initialRedirect?.toPath ?? "",
    statusCode: (initialRedirect?.statusCode ?? 301) as RedirectStatusCode,
    isActive: initialRedirect?.isActive ?? true,
    notes: initialRedirect?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    const url =
      mode === "create"
        ? "/api/admin/redirects"
        : `/api/admin/redirects/${initialRedirect?.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to save redirect.");
      }
      setMessage(mode === "create" ? "Redirect created." : "Redirect saved.");
      const redirect = json.data?.redirect;
      if (mode === "create" && redirect?.id) {
        router.replace(`/admin/redirects/${redirect.id}`);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-6">
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

      <p className="text-sm text-muted-foreground">
        Use redirects for old website URLs or changed slugs. Example:{" "}
        <code className="rounded bg-muted px-1">/old-page</code> →{" "}
        <code className="rounded bg-muted px-1">/new-page</code>
      </p>

      <Input
        label="From path"
        value={form.fromPath}
        onChange={(e) => setForm((f) => ({ ...f, fromPath: e.target.value }))}
        placeholder="/old-services/facility-management"
        required
        hint="Must start with /. No domain."
      />
      <Input
        label="To path or URL"
        value={form.toPath}
        onChange={(e) => setForm((f) => ({ ...f, toPath: e.target.value }))}
        placeholder="/services/facility-management"
        required
        hint="Internal path (/) or full https:// URL"
      />
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">Status code</label>
        <select
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={form.statusCode}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              statusCode: Number(e.target.value) as RedirectStatusCode,
            }))
          }
        >
          {STATUS_OPTIONS.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
        />
        Active
      </label>
      <Textarea
        label="Notes"
        rows={4}
        value={form.notes}
        onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        placeholder="Optional internal notes"
      />

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : mode === "create" ? "Create redirect" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
