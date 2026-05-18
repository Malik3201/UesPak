import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JobDetailView from "@/components/public/careers/JobDetailView";
import JsonLdScripts from "@/components/public/catalog/JsonLdScripts";
import {
  getJobBySlug,
  getJobSeoMetadata,
  getPublishedJobSlugs,
} from "@/lib/jobs";
import { getCanonicalUrl } from "@/lib/seo-settings";
import { SITE_URL } from "@/lib/seo";
import type { IJob } from "@/models/Job";
import { JOB_TYPE_LABELS } from "@/types/job";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getPublishedJobSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) {
    return {
      title: "Job Not Found | UESPAK",
      robots: { index: false, follow: false },
    };
  }
  return getJobSeoMetadata(job);
}

function mapEmploymentType(jobType: IJob["jobType"]): string {
  const map: Record<IJob["jobType"], string> = {
    "full-time": "FULL_TIME",
    "part-time": "PART_TIME",
    contract: "CONTRACTOR",
    internship: "INTERN",
    remote: "FULL_TIME",
  };
  return map[jobType] || "FULL_TIME";
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) notFound();

  const jobUrl = getCanonicalUrl(`/careers/${job.slug}`);
  const description =
    job.shortDescription?.trim() ||
    job.description?.replace(/<[^>]+>/g, " ").trim().slice(0, 500) ||
    undefined;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Careers", item: `${SITE_URL}/careers` },
      { "@type": "ListItem", position: 3, name: job.title, item: jobUrl },
    ],
  };

  const jobPostingJsonLd =
    job.title && description
      ? {
          "@context": "https://schema.org",
          "@type": "JobPosting",
          title: job.title,
          description,
          datePosted: job.publishedAt
            ? new Date(job.publishedAt).toISOString().split("T")[0]
            : new Date(job.createdAt).toISOString().split("T")[0],
          employmentType: mapEmploymentType(job.jobType),
          hiringOrganization: {
            "@type": "Organization",
            name: "UESPAK",
            sameAs: SITE_URL,
          },
          jobLocation: job.location
            ? {
                "@type": "Place",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: job.location,
                },
              }
            : undefined,
          applicantLocationRequirements: job.workMode === "remote"
            ? { "@type": "Country", name: "Pakistan" }
            : undefined,
          jobLocationType: job.workMode === "remote" ? "TELECOMMUTE" : undefined,
          identifier: {
            "@type": "PropertyValue",
            name: "UESPAK",
            value: job.slug,
          },
          url: jobUrl,
          occupationalCategory: job.department || JOB_TYPE_LABELS[job.jobType],
          validThrough: job.deadline
            ? new Date(job.deadline).toISOString()
            : undefined,
        }
      : null;

  const jsonLd = jobPostingJsonLd
    ? [breadcrumbJsonLd, jobPostingJsonLd]
    : [breadcrumbJsonLd];

  return (
    <>
      <JobDetailView job={job} />
      <JsonLdScripts data={jsonLd} />
    </>
  );
}
