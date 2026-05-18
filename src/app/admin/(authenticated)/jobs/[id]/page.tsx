import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import JobForm from "@/components/admin/jobs/JobForm";
import { getCurrentAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Job } from "@/models/Job";
import type { JobDto } from "@/types/job";

export const metadata: Metadata = {
  title: "Edit Job | UESPAK Admin",
  robots: { index: false, follow: false },
};

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  await connectDB();
  const { id } = await params;
  const job = await Job.findById(id).lean();
  if (!job) notFound();

  const plainJob: Partial<JobDto> = {
    id: String(job._id),
    title: job.title,
    slug: job.slug,
    department: job.department,
    location: job.location,
    jobType: job.jobType,
    workMode: job.workMode,
    experienceLevel: job.experienceLevel,
    experienceRequired: job.experienceRequired,
    shortDescription: job.shortDescription,
    description: job.description,
    responsibilities: job.responsibilities ?? [],
    requirements: job.requirements ?? [],
    benefits: job.benefits ?? [],
    skills: job.skills ?? [],
    applyEmail: job.applyEmail,
    applyUrl: job.applyUrl,
    applicationInstructions: job.applicationInstructions,
    deadline: job.deadline ? new Date(job.deadline).toISOString().slice(0, 10) : undefined,
    status: job.status,
    isFeatured: Boolean(job.isFeatured),
    order: job.order ?? 0,
    seo: job.seo,
    publishedAt: job.publishedAt
      ? new Date(job.publishedAt).toISOString()
      : undefined,
    updatedAt: job.updatedAt
      ? new Date(job.updatedAt).toISOString()
      : undefined,
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Job</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update job details, application settings, and SEO.
        </p>
      </div>
      <JobForm mode="edit" initialJob={plainJob} />
    </div>
  );
}
