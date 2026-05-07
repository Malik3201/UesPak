"use client";

import Link from "next/link";
import { Button } from "@/components/shared/Button";
import type { ProjectCategoryDto } from "@/types/project";
import { getProjectGroupLabel } from "@/types/project";
import ProjectCategoryStatusBadge from "@/components/admin/projects/ProjectCategoryStatusBadge";

interface ProjectCategoriesTableProps {
  categories: ProjectCategoryDto[];
  onArchive: (id: string) => Promise<void>;
}

export default function ProjectCategoriesTable({
  categories,
  onArchive,
}: ProjectCategoriesTableProps) {
  if (!categories.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        No project categories found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-semibold">Name</th>
            <th className="px-4 py-3 font-semibold">Slug</th>
            <th className="px-4 py-3 font-semibold">Group</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Order</th>
            <th className="px-4 py-3 font-semibold">Updated</th>
            <th className="px-4 py-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id} className="border-t border-border/60">
              <td className="px-4 py-3">
                <div className="font-medium text-foreground">{category.name}</div>
                {category.description ? (
                  <div className="line-clamp-1 text-xs text-muted-foreground">
                    {category.description}
                  </div>
                ) : null}
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">{category.slug}</td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {category.projectGroup
                  ? getProjectGroupLabel(category.projectGroup)
                  : "-"}
              </td>
              <td className="px-4 py-3">
                <ProjectCategoryStatusBadge status={category.status} />
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">{category.order}</td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {category.updatedAt
                  ? new Date(category.updatedAt).toLocaleString()
                  : "-"}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/project-categories/${category.id}`}>
                    <Button type="button" variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  {category.status !== "archived" ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => void onArchive(category.id)}
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

