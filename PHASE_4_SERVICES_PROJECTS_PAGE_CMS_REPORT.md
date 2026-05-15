# Phase 4 — Services & Projects Page CMS Report

## Summary

Extended the existing **PageContent** CMS (same architecture as About/Careers/Contact) with `pageKey` values `services` and `projects`. Admins can manage listing-page hero, intro, tabs toggle, bottom CTA, media, and SEO without touching individual service/project records.

## CMS Fields Added

### Hero (both pages)
- eyebrow, title, description
- backgroundImage (ImageKit `/uespak/pages`, usage `services-page-hero` / `projects-page-hero`)
- overlayOpacity (0–1, admin UI 0–100%)
- primaryButtonText, primaryButtonUrl

### Intro
- title, description
- showGroupTabs (boolean)

### CTA
- title, description, buttonText, buttonUrl
- backgroundImage optional (`services-page-cta` / `projects-page-cta`)
- isActive

### SEO
- metaTitle, metaDescription, keywords, canonicalUrl
- ogTitle, ogDescription, ogImage (`/uespak/seo`, usage `page-og`)
- robots.index, robots.follow, schemaType

## Admin Routes Added

| Route | Purpose |
|-------|---------|
| `/admin/pages/services` | Services listing page CMS |
| `/admin/pages/projects` | Projects listing page CMS |

Sidebar links: **Services Page**, **Projects Page** (under existing page group, before Services/Projects CRUD).

API: existing `GET/PATCH /api/admin/pages/[pageKey]` — no new route file.

## Public Integration

### `/services`
- Loads `getServicesPageContent()` merged with defaults
- `CatalogHero` + `ServicesCatalog` + `CatalogBottomCta` use CMS values
- Dynamic published services list unchanged
- `showGroupTabs` controls filter tabs

### `/projects`
- Same pattern via `getProjectsPageContent()`

### Group pages
- `/services/group/[group]` — hero image/overlay + CTA from Services page CMS; group title/description fallbacks unchanged
- `/projects/group/[group]` — hero image/overlay + CTA from Projects page CMS; group fallbacks unchanged

## SEO Behavior

- `/services` — `generateMetadata()` → `getPageSeoMetadata(pageContent)`
- `/projects` — same
- Group pages — existing group-specific `buildMetadata` (unchanged)
- Service/project detail pages — existing document SEO (unchanged)

## Persistence

- Zod schemas: `servicesPageSchema`, `projectsPageSchema`
- Mongoose: `hero.overlayOpacity`; sections stored as Mixed
- `preservePageMedia()` extended for services/projects (hero background, overlay, ogImage, CTA background)
- Admin form sends full payload including normalized media from `AdminMediaUploader`

## Manual Tests

- Lint: pass
- Build: pass (MongoDB DNS warnings during SSG are environmental)
- Admin: save/reload flow uses same PATCH/GET as About page
- Public: listing pages read CMS with code fallbacks when DB empty

## Files Touched

**Types/constants/validators:** `page-content.ts`, `constants/page-content.ts`, `validators/page-content.validator.ts`, `models/PageContent.ts`

**Lib/API:** `lib/page-content.ts`, `api/admin/pages/[pageKey]/route.ts`

**Admin:** `PageContentForm.tsx`, `AdminSidebar.tsx`, `admin/pages/services/page.tsx`, `admin/pages/projects/page.tsx`

**Public:** `services/page.tsx`, `projects/page.tsx`, group pages, `CatalogHero.tsx`, `CatalogBottomCta.tsx`, `ServicesCatalog.tsx`, `ProjectsCatalog.tsx`
