"use client";

import Link from "next/link";
import { Button } from "@/components/shared/Button";
import type { ProjectDto } from "@/types/project";
import { getProjectGroupLabel } from "@/types/project";
import ProjectStatusBadge from "@/components/admin/projects/ProjectStatusBadge";

export default function ProjectsTable({
  projects,
  onArchive,
}: {
  projects: ProjectDto[];
  onArchive: (id: string) => Promise<void>;
}) {
  if (!projects.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        No projects found. Create your first project to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-[1100px] text-sm">
        <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-semibold">Title</th>
            <th className="px-4 py-3 font-semibold">Slug</th>
            <th className="px-4 py-3 font-semibold">Group</th>
            <th className="px-4 py-3 font-semibold">Categories</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Featured</th>
            <th className="px-4 py-3 font-semibold">Order</th>
            <th className="px-4 py-3 font-semibold">Updated</th>
            <th className="px-4 py-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id} className="border-t border-border/60">
              <td className="px-4 py-3">
                <div className="font-medium text-foreground">{project.title}</div>
                {project.excerpt ? (
                  <div className="line-clamp-1 text-xs text-muted-foreground">
                    {project.excerpt}
                  </div>
                ) : null}
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">{project.slug}</td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {getProjectGroupLabel(project.projectGroup || "engineering")}
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {project.categoriesSnapshot?.length
                  ? project.categoriesSnapshot.map((c) => c.name).join(", ")
                  : "-"}
              </td>
              <td className="px-4 py-3">
                <ProjectStatusBadge status={project.status} />
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {project.isFeatured ? "Yes" : "No"}
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">{project.order}</td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {project.updatedAt ? new Date(project.updatedAt).toLocaleString() : "-"}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/projects/${project.id}`}>
                    <Button type="button" variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  {project.status === "published" ? (
                    <Link href={`/projects/${project.slug}`} target="_blank">
                      <Button type="button" variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  ) : null}
                  {project.status !== "archived" ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => void onArchive(project.id)}
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

