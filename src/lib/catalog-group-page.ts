import type { GroupPageHeroSettings, PageHero } from "@/types/page-content";

export function resolveGroupHeroBackgroundUrl(
  group?: GroupPageHeroSettings,
  mainHero?: PageHero
): string | undefined {
  const groupUrl = group?.backgroundImage?.url?.trim();
  if (groupUrl) return groupUrl;
  return mainHero?.backgroundImage?.url?.trim() || undefined;
}

export function resolveGroupOverlayOpacity(
  group?: GroupPageHeroSettings,
  mainHero?: PageHero,
  fallback = 0.88
): number {
  if (group?.overlayOpacity != null) return group.overlayOpacity;
  if (mainHero?.overlayOpacity != null) return mainHero.overlayOpacity;
  return fallback;
}

export function resolveGroupHeroTitle(
  group: GroupPageHeroSettings | undefined,
  fallbackTitle: string
): string {
  return group?.title?.trim() || fallbackTitle;
}

export function resolveGroupHeroDescription(
  group: GroupPageHeroSettings | undefined,
  fallbackDescription: string
): string {
  return group?.description?.trim() || fallbackDescription;
}
