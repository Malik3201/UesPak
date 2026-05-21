"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import AdminUsersTable from "@/components/admin/users/AdminUsersTable";
import type { AdminUserDto } from "@/types/admin-user";

interface UsersResponse {
  users: AdminUserDto[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

interface AdminUsersPageClientProps {
  currentUserId: string;
}

export default function AdminUsersPageClient({
  currentUserId,
}: AdminUsersPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UsersResponse | null>(null);

  const page = Number(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") || "";
  const status = searchParams.get("status") || "";

  async function loadUsers() {
    try {
      const q = new URLSearchParams();
      if (search) q.set("search", search);
      if (role) q.set("role", role);
      if (status) q.set("status", status);
      q.set("page", String(page));
      q.set("limit", "20");
      const res = await fetch(`/api/admin/users?${q.toString()}`, {
        credentials: "include",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        if (res.status === 401) {
          router.replace("/admin/login");
          return;
        }
        if (res.status === 403) {
          setError("Only super admins can manage admin users.");
          return;
        }
        throw new Error(json?.message || "Failed to load users.");
      }
      setData(json.data as UsersResponse);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable(id: string) {
    if (!confirm("Disable this admin user? They will not be able to log in.")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to disable user.");
      }
      await loadUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Disable failed.");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, role, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage who can access the UESPAK admin panel. Super admin only.
          </p>
        </div>
        <Link href="/admin/users/new">
          <Button>Add User</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-card p-4">
        <Input
          label="Search"
          placeholder="Name or email..."
          defaultValue={search}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const v = (e.target as HTMLInputElement).value;
              const q = new URLSearchParams(searchParams.toString());
              if (v) q.set("search", v);
              else q.delete("search");
              q.set("page", "1");
              router.push(`/admin/users?${q.toString()}`);
            }
          }}
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Role</label>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={role}
            onChange={(e) => {
              const q = new URLSearchParams(searchParams.toString());
              if (e.target.value) q.set("role", e.target.value);
              else q.delete("role");
              q.set("page", "1");
              router.push(`/admin/users?${q.toString()}`);
            }}
          >
            <option value="">All</option>
            <option value="superAdmin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Status</label>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={status}
            onChange={(e) => {
              const q = new URLSearchParams(searchParams.toString());
              if (e.target.value) q.set("status", e.target.value);
              else q.delete("status");
              q.set("page", "1");
              router.push(`/admin/users?${q.toString()}`);
            }}
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Disabled</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : loading ? (
        <p className="text-sm text-muted-foreground">Loading users...</p>
      ) : (
        <AdminUsersTable
          users={data?.users ?? []}
          currentUserId={currentUserId}
          onDisable={handleDisable}
        />
      )}
    </div>
  );
}
