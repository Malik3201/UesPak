import Link from "next/link";
import RedirectStatusBadge from "@/components/admin/redirects/RedirectStatusBadge";
import { Button } from "@/components/shared/Button";
import type { RedirectDto } from "@/types/redirect";
import { REDIRECT_STATUS_LABELS } from "@/types/redirect";

interface RedirectsTableProps {
  redirects: RedirectDto[];
  onToggleActive: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
}

export default function RedirectsTable({
  redirects,
  onToggleActive,
  onDelete,
}: RedirectsTableProps) {
  if (!redirects.length) {
    return (
      <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No redirects yet. Create one for old URLs or changed slugs.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-border bg-muted/40">
          <tr>
            <th className="px-4 py-3 font-semibold">From</th>
            <th className="px-4 py-3 font-semibold">To</th>
            <th className="px-4 py-3 font-semibold">Code</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Hits</th>
            <th className="px-4 py-3 font-semibold">Last hit</th>
            <th className="px-4 py-3 font-semibold">Updated</th>
            <th className="px-4 py-3 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {redirects.map((r) => (
            <tr key={r.id} className="border-b border-border/60 last:border-0">
              <td className="px-4 py-3 font-mono text-xs">{r.fromPath}</td>
              <td className="max-w-[200px] truncate px-4 py-3 font-mono text-xs" title={r.toPath}>
                {r.toPath}
              </td>
              <td className="px-4 py-3">{REDIRECT_STATUS_LABELS[r.statusCode]}</td>
              <td className="px-4 py-3">
                <RedirectStatusBadge isActive={r.isActive} />
              </td>
              <td className="px-4 py-3">{r.hitCount}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {r.lastHitAt ? new Date(r.lastHitAt).toLocaleString() : "—"}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : "—"}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Link href={`/admin/redirects/${r.id}`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleActive(r.id, !r.isActive)}
                  >
                    {r.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(r.id)}>
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
