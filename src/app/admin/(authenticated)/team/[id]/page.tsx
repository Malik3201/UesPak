import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import TeamMemberForm from "@/components/admin/team/TeamMemberForm";
import { getCurrentAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { TeamMember } from "@/models/TeamMember";
import { serializeTeamMember } from "@/lib/team";

export const metadata: Metadata = {
  title: "Edit Team Member | UESPAK Admin",
  robots: { index: false, follow: false },
};

export default async function EditTeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  await connectDB();
  const { id } = await params;
  const doc = await TeamMember.findById(id).lean();
  if (!doc) notFound();

  const member = serializeTeamMember(doc as unknown as Record<string, unknown>);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Edit Team Member
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update profile, photo, expertise, social, and SEO settings.
        </p>
      </div>
      <TeamMemberForm mode="edit" initialMember={member} />
    </div>
  );
}
