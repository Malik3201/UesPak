import type { PublicSiteSettings } from "@/types/site-settings";
import { getGroupedPublishedServices } from "@/lib/services";
import { getGroupedPublishedProjects } from "@/lib/projects";
import NavbarClient from "@/components/public/NavbarClient";

interface NavbarProps {
  settings: PublicSiteSettings;
}

export default async function Navbar({ settings }: NavbarProps) {
  const grouped = await getGroupedPublishedServices();
  const engineeringLinks = grouped.engineering.slice(0, 8);
  const agricultureLinks = grouped.agriculture.slice(0, 8);
  const groupedProjects = await getGroupedPublishedProjects();
  const engineeringProjectLinks = groupedProjects.engineering.slice(0, 6);
  const agricultureProjectLinks = groupedProjects.agriculture.slice(0, 6);
  const automationProjectLinks = groupedProjects.industrialAutomation.slice(0, 6);

  return (
    <NavbarClient
      settings={settings}
      servicesMenu={[
        {
          title: "Engineering Services",
          viewAllHref: "/services/group/engineering",
          links: engineeringLinks.map((service) => ({
            href: `/services/${service.slug}`,
            label: service.title,
          })),
        },
        {
          title: "Agriculture Services",
          viewAllHref: "/services/group/agriculture",
          links: agricultureLinks.map((service) => ({
            href: `/services/${service.slug}`,
            label: service.title,
          })),
        },
      ]}
      projectsMenu={[
        {
          title: "Engineering Projects",
          viewAllHref: "/projects/group/engineering",
          links: engineeringProjectLinks.map((project) => ({
            href: `/projects/${project.slug}`,
            label: project.title,
          })),
        },
        {
          title: "Agriculture Projects",
          viewAllHref: "/projects/group/agriculture",
          links: agricultureProjectLinks.map((project) => ({
            href: `/projects/${project.slug}`,
            label: project.title,
          })),
        },
        {
          title: "Industrial Automation",
          viewAllHref: "/projects/group/industrial-automation",
          links: automationProjectLinks.map((project) => ({
            href: `/projects/${project.slug}`,
            label: project.title,
          })),
        },
      ]}
    />
  );
}
