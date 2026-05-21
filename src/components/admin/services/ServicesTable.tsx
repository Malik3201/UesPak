"use client";

import Link from "next/link";
import { Briefcase } from "lucide-react";
import { Button } from "@/components/shared/Button";
import ServiceStatusBadge from "@/components/admin/services/ServiceStatusBadge";
import AdminEmptyState from "@/components/admin/ui/AdminEmptyState";
import {
  AdminTable,
  AdminTableBody,
  AdminTableHead,
  AdminTableRow,
  AdminTableTd,
  AdminTableTh,
} from "@/components/admin/ui/AdminTable";
import type { ServiceDto } from "@/types/service";
import { getServiceGroupLabel } from "@/types/service";

interface ServicesTableProps {
  services: ServiceDto[];
  onArchive: (id: string) => Promise<void>;
}

export default function ServicesTable({ services, onArchive }: ServicesTableProps) {
  if (!services.length) {
    return (
      <AdminEmptyState
        icon={Briefcase}
        title="No services yet"
        description="Create your first service to appear on the public site."
      />
    );
  }

  return (
    <AdminTable minWidth="900px">
      <AdminTableHead>
        <AdminTableRow>
          <AdminTableTh>Title</AdminTableTh>
          <AdminTableTh>Group</AdminTableTh>
          <AdminTableTh>Slug</AdminTableTh>
          <AdminTableTh>Category</AdminTableTh>
          <AdminTableTh>Status</AdminTableTh>
          <AdminTableTh>Featured</AdminTableTh>
          <AdminTableTh>Order</AdminTableTh>
          <AdminTableTh>Updated</AdminTableTh>
          <AdminTableTh>Actions</AdminTableTh>
        </AdminTableRow>
      </AdminTableHead>
      <AdminTableBody>
          {services.map((service) => (
            <AdminTableRow key={service.id}>
              <AdminTableTd>
                <div className="font-medium text-foreground">{service.title}</div>
                {service.excerpt ? (
                  <div className="line-clamp-1 text-xs text-muted-foreground">
                    {service.excerpt}
                  </div>
                ) : null}
              </AdminTableTd>
              <AdminTableTd>
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
              </AdminTableTd>
              <AdminTableTd className="text-xs text-slate-500">{service.slug}</AdminTableTd>
              <AdminTableTd className="text-xs text-slate-500">
                {service.category || "—"}
              </AdminTableTd>
              <AdminTableTd>
                <ServiceStatusBadge status={service.status} />
              </AdminTableTd>
              <AdminTableTd className="text-xs text-slate-500">
                {service.isFeatured ? "Yes" : "No"}
              </AdminTableTd>
              <AdminTableTd className="text-xs text-slate-500">{service.order}</AdminTableTd>
              <AdminTableTd className="text-xs text-slate-500">
                {service.updatedAt
                  ? new Date(service.updatedAt).toLocaleString()
                  : "—"}
              </AdminTableTd>
              <AdminTableTd>
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
              </AdminTableTd>
            </AdminTableRow>
          ))}
      </AdminTableBody>
    </AdminTable>
  );
}
