import type { Metadata } from "next";
import { redirect } from "next/navigation";
import RedirectForm from "@/components/admin/redirects/RedirectForm";
import { connectDB } from "@/lib/db";
import { getRedirectById } from "@/lib/redirects";
import { getCurrentAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Edit Redirect | UESPAK Admin",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminEditRedirectPage({ params }: Props) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const { id } = await params;
  await connectDB();
  const redirectDoc = await getRedirectById(id);
  if (!redirectDoc) redirect("/admin/redirects");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Redirect</h1>
        <p className="mt-1 font-mono text-sm text-muted-foreground">{redirectDoc.fromPath}</p>
      </div>
      <RedirectForm mode="edit" initialRedirect={redirectDoc} />
    </div>
  );
}
