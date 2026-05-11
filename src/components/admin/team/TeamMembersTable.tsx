"use client";

import Link from "next/link";
import { Button } from "@/components/shared/Button";
import TeamMemberStatusBadge from "@/components/admin/team/TeamMemberStatusBadge";
import type { TeamMemberDto } from "@/types/team";

interface TeamMembersTableProps {
  members: TeamMemberDto[];
  onArchive: (id: string) => Promise<void>;
}

export default function TeamMembersTable({
  members,
  onArchive,
}: TeamMembersTableProps) {
  if (!members.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        No team members found. Create your first team member to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-semibold">Member</th>
            <th className="px-4 py-3 font-semibold">Designation</th>
            <th className="px-4 py-3 font-semibold">Department</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Featured</th>
            <th className="px-4 py-3 font-semibold">Order</th>
            <th className="px-4 py-3 font-semibold">Updated</th>
            <th className="px-4 py-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} className="border-t border-border/60">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {member.image?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.image.url}
                      alt={member.image.altText || member.name}
                      className="h-10 w-10 rounded-full object-cover ring-1 ring-border"
                    />
                  ) : (
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-50 text-xs font-bold text-[#075f3f] ring-1 ring-border">
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-foreground">
                      {member.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {member.slug}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-foreground/90">
                {member.designation}
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {member.department || "-"}
              </td>
              <td className="px-4 py-3">
                <TeamMemberStatusBadge status={member.status} />
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {member.isFeatured ? "Yes" : "No"}
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {member.order}
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {member.updatedAt
                  ? new Date(member.updatedAt).toLocaleString()
                  : "-"}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/team/${member.id}`}>
                    <Button type="button" variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  {member.status !== "archived" ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => void onArchive(member.id)}
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
