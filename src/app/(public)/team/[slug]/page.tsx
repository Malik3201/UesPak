import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TeamMemberDetailView from "@/components/public/team/TeamMemberDetailView";
import JsonLdScripts from "@/components/public/catalog/JsonLdScripts";
import { buildMetadata, SITE_URL } from "@/lib/seo";
import {
  getAllTeamSlugs,
  getRelatedPublishedTeamMembers,
  getTeamMemberBySlug,
} from "@/lib/team";

export async function generateStaticParams() {
  const slugs = await getAllTeamSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const member = await getTeamMemberBySlug(slug);
  if (!member) {
    return buildMetadata({
      title: "Team Member",
      description: "UESPAK team member profile.",
      canonicalPath: `/team/${slug}`,
    });
  }

  const seo = member.seo || {};
  const ogImage =
    typeof seo.ogImage === "object" ? seo.ogImage?.url : member.image?.url;

  return buildMetadata({
    title: seo.metaTitle?.trim() || `${member.name} | UESPAK Team`,
    description:
      seo.metaDescription?.trim() ||
      member.shortBio ||
      `${member.name}, ${member.designation} at UESPAK.`,
    canonicalPath: `/team/${member.slug}`,
    ogImage,
  });
}

export default async function TeamMemberPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const member = await getTeamMemberBySlug(slug);
  if (!member) notFound();

  const relatedMembers = await getRelatedPublishedTeamMembers(member.slug, 3);

  const memberUrl = `${SITE_URL}/team/${member.slug}`;
  const teamListingUrl = `${SITE_URL}/careers#team`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Team", item: teamListingUrl },
      { "@type": "ListItem", position: 3, name: member.name, item: memberUrl },
    ],
  };

  const personJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: member.name,
    jobTitle: member.designation,
    url: memberUrl,
    worksFor: {
      "@type": "Organization",
      name: "UESPAK",
      url: SITE_URL,
    },
  };
  if (member.image?.url) personJsonLd.image = member.image.url;
  if (member.email?.trim()) personJsonLd.email = member.email.trim();

  return (
    <>
      <TeamMemberDetailView member={member} relatedMembers={relatedMembers} />
      <JsonLdScripts data={[breadcrumbJsonLd, personJsonLd]} />
    </>
  );
}
