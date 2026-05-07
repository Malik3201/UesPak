"use client";

import Link from "next/link";
import { Button } from "@/components/shared/Button";
import ServiceStatusBadge from "@/components/admin/services/ServiceStatusBadge";
import type { ServiceDto } from "@/types/service";
import { getServiceGroupLabel } from "@/types/service";

interface ServicesTableProps {
  services: ServiceDto[];
  onArchive: (id: string) => Promise<void>;
}

export default function ServicesTable({ services, onArchive }: ServicesTableProps) {
  if (!services.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        No services found. Create your first service to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-semibold">Title</th>
            <th className="px-4 py-3 font-semibold">Group</th>
            <th className="px-4 py-3 font-semibold">Slug</th>
            <th className="px-4 py-3 font-semibold">Category</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Featured</th>
            <th className="px-4 py-3 font-semibold">Order</th>
            <th className="px-4 py-3 font-semibold">Updated</th>
            <th className="px-4 py-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.id} className="border-t border-border/60">
              <td className="px-4 py-3">
                <div className="font-medium text-foreground">{service.title}</div>
                {service.excerpt ? (
                  <div className="line-clamp-1 text-xs text-muted-foreground">
                    {service.excerpt}
                  </div>
                ) : null}
              </td>
              <td className="px-4 py-3">
                <span
                  className={[
                    "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                    (service.serviceGroup || "engineering") === "agriculture"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border-primary/30 bg-primary/10 text-primary",
                  ].join(" ")}
                  title={getServiceGroupLabel(
                    ((service.serviceGroup || "engineering") as "engineering" | "agriculture")
                  )}
                >
                  {(service.serviceGroup || "engineering") === "agriculture"
                    ? "Agriculture"
                    : "Engineering"}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">{service.slug}</td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {service.category || "-"}
              </td>
              <td className="px-4 py-3">
                <ServiceStatusBadge status={service.status} />
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {service.isFeatured ? "Yes" : "No"}
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">{service.order}</td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {service.updatedAt
                  ? new Date(service.updatedAt).toLocaleString()
                  : "-"}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/services/${service.id}`}>
                    <Button type="button" variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  {service.status === "published" ? (
                    <Link href={`/services/${service.slug}`} target="_blank">
                      <Button type="button" variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  ) : null}
                  {service.status !== "archived" ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => void onArchive(service.id)}
                    >
                      Archive
                    </Button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
