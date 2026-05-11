import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import TeamMembersPageClient from "@/components/admin/team/TeamMembersPageClient";

export const metadata: Metadata = {
  title: "Team Members | UESPAK Admin",
  robots: { index: false, follow: false },
};

export default async function AdminTeamPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return <TeamMembersPageClient />;
}
