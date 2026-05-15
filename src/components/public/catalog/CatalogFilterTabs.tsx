"use client";

import { cn } from "@/lib/utils";

export interface CatalogFilterTab<T extends string> {
  id: T;
  label: string;
  shortLabel: string;
}

interface CatalogFilterTabsProps<T extends string> {
  tabs: CatalogFilterTab<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  counts: Record<T, number>;
  ariaLabel: string;
}

export default function CatalogFilterTabs<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  counts,
  ariaLabel,
}: CatalogFilterTabsProps<T>) {
  return (
    <div
      className={cn(
        "mt-10",
        "-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth px-4 pb-2",
        "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        "md:mx-0 md:snap-none md:flex-wrap md:justify-center md:overflow-visible md:px-0 md:pb-0"
      )}
      role="tablist"
      aria-label={ariaLabel}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "shrink-0 snap-start rounded-full px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all",
            "active:scale-[0.98] md:py-2 md:active:scale-100",
            activeTab === tab.id
              ? "bg-[#075f3f] text-white shadow-[0_8px_20px_rgba(7,95,63,0.25)]"
              : "border border-emerald-900/10 bg-white text-slate-700 shadow-sm hover:border-emerald-400/50 hover:text-[#075f3f] md:bg-[#f7fbf8] md:shadow-none"
          )}
        >
          <span className="md:hidden">{tab.shortLabel}</span>
          <span className="hidden md:inline">{tab.label}</span>
          <span className="ml-1.5 text-xs opacity-80">({counts[tab.id]})</span>
        </button>
      ))}
    </div>
  );
}
