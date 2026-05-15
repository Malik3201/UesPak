"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { NavMenuGroup } from "@/lib/nav-menu";

const MAX_FLYOUT_ITEMS = 8;

interface NavFlyoutMenuProps {
  id: string;
  label: string;
  href: string;
  groups: NavMenuGroup[];
  browseAllHref: string;
  browseAllLabel: string;
  itemCountLabel: "services" | "projects";
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  triggerClassName?: string;
}

function countLabel(count: number, itemLabel: "services" | "projects") {
  const noun = count === 1 ? itemLabel.replace(/s$/, "") : itemLabel;
  return `${count} ${noun}`;
}

function FlyoutItemsPanel({
  group,
  itemCountLabel,
}: {
  group: NavMenuGroup;
  itemCountLabel: "services" | "projects";
}) {
  const items = group.links.slice(0, MAX_FLYOUT_ITEMS);
  const hasMore = group.links.length > MAX_FLYOUT_ITEMS;

  return (
    <div className="flex w-[min(92vw,22rem)] flex-col sm:w-80">
      <div className="border-b border-emerald-900/10 px-4 py-3">
        <p className="text-sm font-semibold text-[#03452e]">{group.title}</p>
        <p className="mt-0.5 text-xs text-slate-500">
          {group.links.length
            ? countLabel(group.links.length, itemCountLabel)
            : "No items yet"}
        </p>
      </div>

      <div className="max-h-[min(22rem,60vh)] overflow-y-auto p-2">
        {items.length ? (
          <ul className="space-y-0.5">
            {items.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group/item flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition-all duration-200 hover:bg-[#075f3f] hover:text-white focus-visible:bg-[#075f3f] focus-visible:text-white focus-visible:outline-none"
                >
                  <span className="line-clamp-2 leading-snug">{link.label}</span>
                  <ChevronRight
                    className="h-4 w-4 shrink-0 opacity-40 transition-all duration-200 group-hover/item:translate-x-0.5 group-hover/item:opacity-100"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-3 py-4 text-sm text-slate-500">No items available.</p>
        )}
      </div>

      <div className="border-t border-emerald-900/10 p-2">
        <Link
          href={group.viewAllHref}
          className="flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#075f3f] transition-colors hover:bg-[#edf7f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c8b59]/40"
        >
          View all {group.title.toLowerCase()}
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
        {hasMore ? (
          <p className="px-3 pb-1 text-xs text-slate-500">
            Showing {MAX_FLYOUT_ITEMS} of {group.links.length}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function NavFlyoutMenu({
  id,
  label,
  href,
  groups,
  browseAllHref,
  browseAllLabel,
  itemCountLabel,
  isOpen,
  onOpen,
  onClose,
  triggerClassName = "",
}: NavFlyoutMenuProps) {
  const panelId = `${id}-panel`;
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimer.current = setTimeout(onClose, 150);
  };

  useEffect(() => () => clearCloseTimer(), []);

  const openMenu = () => {
    setActiveIndex(0);
    onOpen();
  };

  const activeGroup =
    activeIndex >= 0 && activeIndex < groups.length ? groups[activeIndex] : null;
  const showFlyout = Boolean(activeGroup);

  return (
    <li
      className="relative"
      onMouseEnter={() => {
        clearCloseTimer();
        openMenu();
      }}
      onMouseLeave={scheduleClose}
    >
      <Link
        href={href}
        id={id}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-haspopup="true"
        onFocus={openMenu}
        className={`inline-flex items-center gap-1 text-sm font-medium transition-colors ${triggerClassName}`}
      >
        {label}
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          aria-hidden
        />
      </Link>

      <div
        className={`pointer-events-none absolute left-0 top-full z-[60] pt-2 transition-all duration-200 ${
          isOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-1 opacity-0"
        }`}
        onMouseEnter={clearCloseTimer}
        onMouseLeave={scheduleClose}
      >
        <div
          id={panelId}
          role="region"
          aria-labelledby={id}
          className={`pointer-events-auto flex items-stretch ${isOpen ? "" : "hidden"}`}
        >
          {/* Primary category list */}
          <div className="w-[min(92vw,18.5rem)] overflow-hidden rounded-xl border border-emerald-900/10 bg-white shadow-[0_20px_50px_rgba(2,33,23,0.16)] ring-1 ring-black/[0.04] sm:w-[19.5rem]">
            <ul className="p-1.5" role="list">
              {groups.map((group, index) => {
                const isActive = activeIndex === index;
                return (
                  <li key={group.title}>
                    <Link
                      href={group.viewAllHref}
                      onMouseEnter={() => setActiveIndex(index)}
                      onFocus={() => setActiveIndex(index)}
                      className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c8b59]/50 ${
                        isActive
                          ? "bg-[#075f3f] text-white shadow-sm"
                          : "text-slate-800 hover:bg-[#075f3f] hover:text-white"
                      }`}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold leading-snug">
                          {group.title}
                        </span>
                        <span
                          className={`mt-0.5 block text-xs ${
                            isActive ? "text-white/80" : "text-slate-500"
                          }`}
                        >
                          {group.links.length
                            ? countLabel(group.links.length, itemCountLabel)
                            : "Coming soon"}
                        </span>
                      </span>
                      <ChevronRight
                        className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                          isActive ? "translate-x-0.5 text-white" : "text-[#0c8b59]"
                        }`}
                        aria-hidden
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-emerald-900/10 p-1.5">
              <Link
                href={browseAllHref}
                onMouseEnter={() => setActiveIndex(-1)}
                onFocus={() => setActiveIndex(-1)}
                className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c8b59]/50 ${
                  activeIndex === -1
                    ? "bg-[#075f3f] text-white"
                    : "text-[#075f3f] hover:bg-[#075f3f] hover:text-white"
                }`}
              >
                {browseAllLabel}
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>

          {/* Secondary flyout — overlaps slightly to prevent hover gap */}
          <div
            className={`ml-1 overflow-hidden rounded-xl border border-emerald-900/10 bg-white shadow-[0_20px_50px_rgba(2,33,23,0.16)] ring-1 ring-black/[0.04] transition-all duration-200 ${
              showFlyout
                ? "visible translate-x-0 opacity-100"
                : "pointer-events-none invisible w-0 -translate-x-1 opacity-0"
            }`}
            onMouseEnter={clearCloseTimer}
          >
            {activeGroup ? (
              <FlyoutItemsPanel group={activeGroup} itemCountLabel={itemCountLabel} />
            ) : null}
          </div>
        </div>
      </div>
    </li>
  );
}

/* ─── Mobile (unchanged accordion pattern) ─── */

const MAX_MOBILE_LINKS = 6;

interface MobileCatalogNavProps {
  servicesMenu: NavMenuGroup[];
  projectsMenu: NavMenuGroup[];
  onNavigate: () => void;
}

export function MobileCatalogNav({
  servicesMenu,
  projectsMenu,
  onNavigate,
}: MobileCatalogNavProps) {
  const [openSection, setOpenSection] = useState<"services" | "projects" | null>(
    null
  );
  const servicesId = useId();
  const projectsId = useId();

  function toggle(section: "services" | "projects") {
    setOpenSection((prev) => (prev === section ? null : section));
  }

  return (
    <div className="space-y-1 border-t border-emerald-900/10 pt-2">
      <MobileCatalogSection
        id={servicesId}
        label="Services"
        href="/services"
        groups={servicesMenu}
        isOpen={openSection === "services"}
        onToggle={() => toggle("services")}
        onNavigate={onNavigate}
      />
      <MobileCatalogSection
        id={projectsId}
        label="Projects"
        href="/projects"
        groups={projectsMenu}
        isOpen={openSection === "projects"}
        onToggle={() => toggle("projects")}
        onNavigate={onNavigate}
      />
    </div>
  );
}

function MobileCatalogSection({
  id,
  label,
  href,
  groups,
  isOpen,
  onToggle,
  onNavigate,
}: {
  id: string;
  label: string;
  href: string;
  groups: NavMenuGroup[];
  isOpen: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  const panelId = `${id}-panel`;

  return (
    <div className="overflow-hidden rounded-xl border border-emerald-900/10 bg-[#f7fbf8]/60">
      <div className="flex items-center">
        <Link
          href={href}
          onClick={onNavigate}
          className="flex-1 px-3 py-2.5 text-sm font-semibold text-[#03452e]"
        >
          {label}
        </Link>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="inline-flex h-10 w-10 items-center justify-center text-[#075f3f]"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            aria-hidden
          />
          <span className="sr-only">Toggle {label} menu</span>
        </button>
      </div>

      {isOpen ? (
        <div id={panelId} className="space-y-3 border-t border-emerald-900/10 px-3 pb-3 pt-2">
          {groups.map((group) => (
            <div key={group.title}>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold tracking-wide text-[#03452e]">
                  {group.title}
                </p>
                <Link
                  href={group.viewAllHref}
                  onClick={onNavigate}
                  className="text-xs font-semibold text-[#0c8b59]"
                >
                  View all
                </Link>
              </div>
              {group.links.length ? (
                <ul className="space-y-0.5">
                  {group.links.slice(0, MAX_MOBILE_LINKS).map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={onNavigate}
                        className="block rounded-lg px-2.5 py-2 text-sm text-slate-700 hover:bg-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-2.5 py-1 text-sm text-slate-500">No items yet.</p>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
