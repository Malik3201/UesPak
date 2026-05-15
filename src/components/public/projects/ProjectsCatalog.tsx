"use client";

import { useMemo, useState } from "react";
import Container from "@/components/shared/Container";
import ProjectCard, { type ProjectCardData } from "@/components/public/projects/ProjectCard";
import type { ProjectGroup } from "@/types/project";
import { cn } from "@/lib/utils";

type FilterTab = "all" | ProjectGroup;

interface ProjectsCatalogProps {
  projects: ProjectCardData[];
  introTitle?: string;
  introDescription?: string;
  showGroupTabs?: boolean;
}

const TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "engineering", label: "Engineering Projects" },
  { id: "agriculture", label: "Agriculture Projects" },
  { id: "industrialAutomation", label: "Industrial Automation" },
];

function matchesTab(project: ProjectCardData, tab: FilterTab): boolean {
  if (tab === "all") return true;
  const group = project.projectGroup || "engineering";
  return group === tab;
}

export default function ProjectsCatalog({
  projects,
  introTitle = "Delivered with precision and measurable outcomes",
  introDescription = "Explore UESPAK engineering, agriculture, and industrial automation projects—structured delivery, technical rigor, and long-term value.",
  showGroupTabs = true,
}: ProjectsCatalogProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const filtered = useMemo(
    () => projects.filter((p) => matchesTab(p, activeTab)),
    [projects, activeTab]
  );

  const tabCounts = useMemo(() => {
    const counts: Record<FilterTab, number> = {
      all: projects.length,
      engineering: 0,
      agriculture: 0,
      industrialAutomation: 0,
    };
    for (const p of projects) {
      const g: ProjectGroup = p.projectGroup || "engineering";
      counts[g]++;
    }
    return counts;
  }, [projects]);

  const visibleTabs = TABS.filter((tab) => tabCounts[tab.id] > 0);

  return (
    <section className="homepage-section-reveal w-full bg-white py-14 md:py-20 lg:py-24">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#075f3f]">
            Portfolio
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#0f172a] md:text-3xl">
            {introTitle}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 md:text-base">
            {introDescription}
          </p>
        </div>

        {showGroupTabs && visibleTabs.length > 1 ? (
          <div
            className="mt-10 flex flex-wrap justify-center gap-2"
            role="tablist"
            aria-label="Filter projects by group"
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
                <span className="ml-1.5 text-xs opacity-80">({tabCounts[tab.id]})</span>
              </button>
            ))}
          </div>
        ) : null}

        {filtered.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-emerald-900/15 bg-[#f7fbf8] p-10 text-center text-slate-600">
            No projects in this category yet.
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
