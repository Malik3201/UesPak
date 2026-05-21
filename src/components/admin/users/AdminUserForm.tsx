"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/shared/Input";
import { Button } from "@/components/shared/Button";
import type { AdminUserDto } from "@/types/admin-user";
import type { AdminRole, AdminStatus } from "@/types/admin";
import { ADMIN_ROLE_LABELS } from "@/types/admin-user";

type FormMode = "create" | "edit";

interface AdminUserFormProps {
  mode: FormMode;
  initialUser?: Partial<AdminUserDto>;
}

const ROLES: AdminRole[] = ["superAdmin", "admin", "editor", "viewer"];
const STATUSES: AdminStatus[] = ["active", "inactive", "suspended"];

export default function AdminUserForm({ mode, initialUser }: AdminUserFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initialUser?.name ?? "",
    email: initialUser?.email ?? "",
    role: (initialUser?.role ?? "editor") as AdminRole,
    status: (initialUser?.status ?? "active") as AdminStatus,
    password: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    const body: Record<string, unknown> = {
      name: form.name,
      email: form.email,
      role: form.role,
      status: form.status,
    };
    if (form.password) {
      body.password = form.password;
      body.confirmPassword = form.confirmPassword;
    }

    const url =
      mode === "create" ? "/api/admin/users" : `/api/admin/users/${initialUser?.id}`;
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
        throw new Error(json?.message || "Failed to save admin user.");
      }
      setMessage(mode === "create" ? "User created." : "User saved.");
      const user = json.data?.user;
      if (mode === "create" && user?.id) {
        router.replace(`/admin/users/${user.id}`);
      } else {
        setForm((f) => ({ ...f, password: "", confirmPassword: "" }));
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

      <Input
        label="Name"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        required
      />
      <Input
        label="Email"
        type="email"
        value={form.email}
        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        required
      />
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">Role</label>
        <select
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={form.role}
          onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as AdminRole }))}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ADMIN_ROLE_LABELS[r]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">Status</label>
        <select
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as AdminStatus }))}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <Input
        label={mode === "create" ? "Password" : "New password"}
        type="password"
        value={form.password}
        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        required={mode === "create"}
        hint={
          mode === "edit"
            ? "Leave password empty when editing if you do not want to change it."
            : "Minimum 8 characters"
        }
      />
      <Input
        label="Confirm password"
        type="password"
        value={form.confirmPassword}
        onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
        required={mode === "create" || Boolean(form.password)}
      />

      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : mode === "create" ? "Create user" : "Save changes"}
      </Button>
    </form>
  );
}
