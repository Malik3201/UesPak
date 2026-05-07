import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import ServiceForm from "@/components/admin/services/ServiceForm";
import { getCurrentAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Service } from "@/models/Service";
import type { ServiceDto, ServiceGroup } from "@/types/service";

export const metadata: Metadata = {
  title: "Edit Service | UESPAK Admin",
  robots: { index: false, follow: false },
};

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  await connectDB();
  const { id } = await params;
  const service = await Service.findById(id).lean();
  if (!service) notFound();

  const plainService: Partial<ServiceDto> = {
    id: String(service._id),
    title: service.title,
    slug: service.slug,
    excerpt: service.excerpt,
    content: service.content,
    serviceGroup:
      ((service as unknown as { serviceGroup?: string }).serviceGroup === "agriculture"
        ? "agriculture"
        : "engineering") satisfies ServiceGroup,
    category: service.category,
    icon: service.icon,
    featuredImage: service.featuredImage,
    gallery: service.gallery ?? [],
    order: service.order ?? 0,
    isFeatured: Boolean(service.isFeatured),
    status: service.status,
    bulletPoints: service.bulletPoints ?? [],
    faqs: service.faqs ?? [],
    cta: service.cta ?? { isActive: false },
    seo: service.seo,
    publishedAt: service.publishedAt
      ? new Date(service.publishedAt).toISOString()
      : undefined,
    createdAt: service.createdAt
      ? new Date(service.createdAt).toISOString()
      : undefined,
    updatedAt: service.updatedAt
      ? new Date(service.updatedAt).toISOString()
      : undefined,
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Service</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update content, media, status, and SEO settings.
        </p>
      </div>
      <ServiceForm mode="edit" initialService={plainService} />
    </div>
  );
}
