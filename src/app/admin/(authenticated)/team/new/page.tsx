import type { Metadata } from "next";
import { redirect } from "next/navigation";
import TeamMemberForm from "@/components/admin/team/TeamMemberForm";
import { getCurrentAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "New Team Member | UESPAK Admin",
  robots: { index: false, follow: false },
};

export default async function NewTeamMemberPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Add Team Member
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new team profile. Save as draft or publish when ready.
        </p>
      </div>
      <TeamMemberForm mode="create" />
    </div>
  );
}
