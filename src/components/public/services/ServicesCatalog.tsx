"use client";

import { useMemo, useState } from "react";
import Container from "@/components/shared/Container";
import ServiceCard, { type ServiceCardData } from "@/components/public/services/ServiceCard";
import type { ServiceGroup } from "@/types/service";
import { cn } from "@/lib/utils";

type FilterTab = "all" | ServiceGroup;

interface ServicesCatalogProps {
  services: ServiceCardData[];
  introTitle?: string;
  introDescription?: string;
}

const TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All Services" },
  { id: "engineering", label: "Engineering Services" },
  { id: "agriculture", label: "Agriculture Services" },
];

export default function ServicesCatalog({
  services,
  introTitle = "Integrated engineering & agriculture capabilities",
  introDescription = "Browse UESPAK service offerings designed for performance, compliance, and long-term operational impact across industrial and agricultural environments.",
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
      <section className="homepage-section-reveal w-full bg-white py-14 md:py-20 lg:py-24">
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

          {visibleTabs.length > 1 ? (
            <div
              className="mt-10 flex flex-wrap justify-center gap-2"
              role="tablist"
              aria-label="Filter services by group"
            >
              {visibleTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition-all",
                    activeTab === tab.id
                      ? "bg-[#075f3f] text-white shadow-[0_8px_20px_rgba(7,95,63,0.25)]"
                      : "border border-emerald-900/10 bg-[#f7fbf8] text-slate-700 hover:border-emerald-400/50 hover:text-[#075f3f]"
                  )}
                >
                  {tab.label}
                  <span className="ml-1.5 text-xs opacity-80">
                    ({tabCounts[tab.id]})
                  </span>
                </button>
              ))}
            </div>
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
