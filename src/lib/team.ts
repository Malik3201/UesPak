import { connectDB } from "@/lib/db";
import { TeamMember, type ITeamMember } from "@/models/TeamMember";
import { SITE_URL } from "@/lib/seo";
import type { TeamMemberDto, TeamMemberStatus } from "@/types/team";

function toIso(value: unknown): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
  }
  return undefined;
}

export function serializeTeamMember(
  member: Record<string, unknown> | ITeamMember
): TeamMemberDto {
  const m = member as Record<string, unknown>;
  return {
    id: String(m._id ?? m.id ?? ""),
    name: String(m.name ?? ""),
    slug: String(m.slug ?? ""),
    designation: String(m.designation ?? ""),
    department: (m.department as string | undefined) || undefined,
    shortBio: (m.shortBio as string | undefined) || undefined,
    bio: (m.bio as string | undefined) || undefined,
    expertise: Array.isArray(m.expertise) ? (m.expertise as string[]) : [],
    qualifications: Array.isArray(m.qualifications)
      ? (m.qualifications as string[])
      : [],
    experienceYears:
      typeof m.experienceYears === "number"
        ? (m.experienceYears as number)
        : undefined,
    image: m.image as TeamMemberDto["image"],
    email: (m.email as string | undefined) || undefined,
    phone: (m.phone as string | undefined) || undefined,
    linkedinUrl: (m.linkedinUrl as string | undefined) || undefined,
    socialLinks: Array.isArray(m.socialLinks)
      ? (m.socialLinks as TeamMemberDto["socialLinks"])
      : [],
    order: Number(m.order ?? 0),
    isFeatured: Boolean(m.isFeatured),
    status: ((m.status as TeamMemberStatus) || "draft") as TeamMemberStatus,
    seo: m.seo as TeamMemberDto["seo"],
    publishedAt: toIso(m.publishedAt),
    createdAt: toIso(m.createdAt),
    updatedAt: toIso(m.updatedAt),
  };
}

export async function getPublishedTeamMembers(): Promise<TeamMemberDto[]> {
  try {
    await connectDB();
    const docs = await TeamMember.find({ status: "published" })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    return docs.map((d) =>
      serializeTeamMember(d as unknown as Record<string, unknown>)
    );
  } catch {
    return [];
  }
}

export async function getFeaturedTeamMembers(): Promise<TeamMemberDto[]> {
  try {
    await connectDB();
    const docs = await TeamMember.find({
      status: "published",
      isFeatured: true,
    })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    return docs.map((d) =>
      serializeTeamMember(d as unknown as Record<string, unknown>)
    );
  } catch {
    return [];
  }
}

export async function getTeamMemberBySlug(
  slug: string
): Promise<TeamMemberDto | null> {
  try {
    await connectDB();
    const doc = await TeamMember.findOne({ slug, status: "published" }).lean();
    if (!doc) return null;
    return serializeTeamMember(doc as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function getAllTeamSlugs(): Promise<string[]> {
  try {
    await connectDB();
    const docs = await TeamMember.find({ status: "published" })
      .select("slug")
      .lean();
    return docs.map((d) =>
      String((d as unknown as Record<string, unknown>).slug || "")
    );
  } catch {
    return [];
  }
}

export function getTeamSeoMetadata(member: TeamMemberDto) {
  const seo = member.seo || {};
  const ogImage =
    typeof seo.ogImage === "object" ? seo.ogImage?.url : member.image?.url;

  return {
    title: seo.metaTitle?.trim() || `${member.name} | UESPAK Team`,
    description:
      seo.metaDescription?.trim() ||
      member.shortBio ||
      `${member.name}, ${member.designation} at UESPAK.`,
    keywords: seo.keywords || [],
    canonical: seo.canonicalUrl?.trim() || `${SITE_URL}/team/${member.slug}`,
    ogTitle:
      seo.ogTitle?.trim() || seo.metaTitle?.trim() || `${member.name} | UESPAK`,
    ogDescription:
      seo.ogDescription?.trim() ||
      seo.metaDescription?.trim() ||
      member.shortBio ||
      `${member.name}, ${member.designation} at UESPAK.`,
    ogImage,
    robots: {
      index: seo.robots?.index !== false,
      follow: seo.robots?.follow !== false,
    },
    schemaType: seo.schemaType || "Person",
  };
}
