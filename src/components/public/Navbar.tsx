import type { PublicSiteSettings } from "@/types/site-settings";
import { getGroupedPublishedServices } from "@/lib/services";
import { getGroupedPublishedProjects } from "@/lib/projects";
import { formatDisplayTitle } from "@/lib/format-display-title";
import { dedupeNavLinks, type NavMenuGroup } from "@/lib/nav-menu";
import NavbarClient from "@/components/public/NavbarClient";

interface NavbarProps {
  settings: PublicSiteSettings;
}

function buildMenuLinks(
  items: { slug: string; title: string }[],
  basePath: "services" | "projects"
) {
  return dedupeNavLinks(
    items.map((item) => ({
      href: `/${basePath}/${item.slug}`,
      label: formatDisplayTitle(item.title),
    }))
  );
}

export default async function Navbar({ settings }: NavbarProps) {
  const grouped = await getGroupedPublishedServices();
  const groupedProjects = await getGroupedPublishedProjects();

  const servicesMenu: NavMenuGroup[] = [
    {
      title: "Engineering Services",
      viewAllHref: "/services/group/engineering",
      links: buildMenuLinks(grouped.engineering, "services"),
    },
    {
      title: "Agriculture Services",
      viewAllHref: "/services/group/agriculture",
      links: buildMenuLinks(grouped.agriculture, "services"),
    },
  ];

  const projectsMenu: NavMenuGroup[] = [
    {
      title: "Engineering Projects",
      viewAllHref: "/projects/group/engineering",
      links: buildMenuLinks(groupedProjects.engineering, "projects"),
    },
    {
      title: "Agriculture Projects",
      viewAllHref: "/projects/group/agriculture",
      links: buildMenuLinks(groupedProjects.agriculture, "projects"),
    },
    {
      title: "Industrial Automation",
      viewAllHref: "/projects/group/industrial-automation",
      links: buildMenuLinks(groupedProjects.industrialAutomation, "projects"),
    },
  ];

  return (
    <NavbarClient
      settings={settings}
      servicesMenu={servicesMenu}
      projectsMenu={projectsMenu}
    />
  );
}
