"use client";

import { useMemo, useState } from "react";
import Container from "@/components/shared/Container";
import ServiceCard, { type ServiceCardData } from "@/components/public/services/ServiceCard";
import type { ServiceGroup } from "@/types/service";
import CatalogFilterTabs from "@/components/public/catalog/CatalogFilterTabs";

type FilterTab = "all" | ServiceGroup;

interface ServicesCatalogProps {
  services: ServiceCardData[];
  introTitle?: string;
  introDescription?: string;
  showGroupTabs?: boolean;
}

const TABS = [
  { id: "all" as const, label: "All Services", shortLabel: "All" },
  { id: "engineering" as const, label: "Engineering Services", shortLabel: "Engineering" },
  { id: "agriculture" as const, label: "Agriculture Services", shortLabel: "Agriculture" },
];

export default function ServicesCatalog({
  services,
  introTitle = "Integrated engineering & agriculture capabilities",
  introDescription = "Browse UESPAK service offerings designed for performance, compliance, and long-term operational impact across industrial and agricultural environments.",
  showGroupTabs = true,
}: ServicesCatalogProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const filtered = useMemo(() => {
    if (activeTab === "all") return services;
    return services.filter((s) =>
      activeTab === "agriculture"
        ? s.serviceGroup === "agriculture"
        : s.serviceGroup !== "agriculture"
    );
  }, [services, activeTab]);

  const tabCounts = useMemo(() => {
    const engineering = services.filter((s) => s.serviceGroup !== "agriculture").length;
    const agriculture = services.filter((s) => s.serviceGroup === "agriculture").length;
    return { all: services.length, engineering, agriculture };
  }, [services]);

  const visibleTabs = TABS.filter((tab) => {
    if (tab.id === "all") return tabCounts.all > 0;
    if (tab.id === "engineering") return tabCounts.engineering > 0;
    return tabCounts.agriculture > 0;
  });

  return (
    <>
      <section className="homepage-section-reveal w-full bg-[linear-gradient(180deg,#f7fbf8_0%,#eef8f2_100%)] py-14 md:py-20 lg:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#075f3f]">
              Our Capabilities
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#0f172a] md:text-3xl">
              {introTitle}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 md:text-base">
              {introDescription}
            </p>
          </div>

          {showGroupTabs && visibleTabs.length > 1 ? (
            <CatalogFilterTabs
              tabs={visibleTabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              counts={tabCounts}
              ariaLabel="Filter services by group"
            />
          ) : null}

          {filtered.length === 0 ? (
            <div className="mt-12 rounded-2xl border border-dashed border-emerald-900/15 bg-[#f7fbf8] p-10 text-center text-slate-600">
              No services in this category yet.
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
