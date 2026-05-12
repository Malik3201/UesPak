"use client";

import { useEffect, useMemo, useState } from "react";
import Input from "@/components/shared/Input";
import Button from "@/components/shared/Button";

type EnquiryStatus = "new" | "read" | "replied" | "archived";

interface EnquiryRow {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  serviceInterest?: string;
  message: string;
  status: EnquiryStatus;
  createdAt?: string | null;
}

const statuses: Array<"all" | EnquiryStatus> = [
  "all",
  "new",
  "read",
  "replied",
  "archived",
];

export default function EnquiriesManager() {
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);
  const [selected, setSelected] = useState<EnquiryRow | null>(null);
  const [status, setStatus] = useState<"all" | EnquiryStatus>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "20");
    if (status !== "all") params.set("status", status);
    if (search.trim()) params.set("search", search.trim());
    return params.toString();
  }, [page, status, search]);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/enquiries?${query}`, {
        credentials: "include",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to load enquiries.");
      }
      setEnquiries(json.data?.enquiries || []);
      setTotalPages(json.data?.totalPages || 1);
    } catch (errObj) {
      setError(errObj instanceof Error ? errObj.message : "Failed to load enquiries.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function updateStatus(enquiry: EnquiryRow, nextStatus: EnquiryStatus) {
    try {
      setMessage(null);
      setError(null);
      const res = await fetch(`/api/admin/enquiries/${enquiry.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to update enquiry.");
      }
      setMessage("Enquiry updated.");
      setSelected(json.data?.enquiry || null);
      await load();
    } catch (errObj) {
      setError(errObj instanceof Error ? errObj.message : "Failed to update enquiry.");
    }
  }

  return (
    <div className="space-y-5">
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

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_14rem]">
          <Input
            label="Search"
            placeholder="Search name, email, subject..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Status</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as "all" | EnquiryStatus);
                setPage(1);
              }}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All statuses" : s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Loading enquiries...
                  </td>
                </tr>
              ) : enquiries.length ? (
                enquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="hover:bg-muted/25">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{enquiry.name}</p>
                      <p className="text-xs text-muted-foreground">{enquiry.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{enquiry.subject}</p>
                      {enquiry.serviceInterest ? (
                        <p className="text-xs text-muted-foreground">
                          {enquiry.serviceInterest}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        {enquiry.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {enquiry.createdAt
                        ? new Date(enquiry.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button type="button" size="sm" variant="outline" onClick={() => setSelected(enquiry)}>
                          View
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => updateStatus(enquiry, "read")}>
                          Read
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => updateStatus(enquiry, "archived")}>
                          Archive
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No enquiries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
          <span className="text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </Button>
            <Button type="button" size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              Next
            </Button>
          </div>
        </div>
      </div>

      {selected ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">{selected.subject}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {selected.name} · {selected.email}
                {selected.phone ? ` · ${selected.phone}` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => updateStatus(selected, "replied")}>
                Mark replied
              </Button>
              <a
                href={`mailto:${encodeURIComponent(selected.email)}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`}
                className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-semibold hover:bg-accent"
              >
                Reply
              </a>
            </div>
          </div>
          <div className="mt-5 rounded-lg bg-muted/35 p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
            {selected.message}
          </div>
        </div>
      ) : null}
    </div>
  );
}
