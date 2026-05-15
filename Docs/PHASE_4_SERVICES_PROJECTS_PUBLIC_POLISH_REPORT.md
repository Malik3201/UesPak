# Phase 4 — Services & Projects Public Polish Report

## Summary

Public Services and Projects listing, group, and detail pages were redesigned to match the UESPAK premium green/white engineering brand. All content remains CMS-driven (`status: "published"` only). Full-width sections with `max-w-7xl` inner containers; no nested boxed-section layouts.

## Services Pages Changes

### `/services`
- Full-width hero with green gradient overlay (`CatalogHero`)
- Intro section with filter tabs: All, Engineering Services, Agriculture Services (`ServicesCatalog` client)
- Premium service cards: image hover zoom, group/category badge, excerpt, up to 3 bullet highlights, equal-height grid (1/2/3 columns)
- Bottom contact CTA (`CatalogBottomCta`)

### `/services/group/[group]`
- Group-specific hero, breadcrumbs, description
- Same premium card grid
- Invalid group → `404`
- `BreadcrumbList` JSON-LD

### `/services/[slug]`
- Featured-image hero with breadcrumbs and group badge (`DetailHero`)
- Two-column layout: main content + sticky sidebar (desktop), stacked on mobile
- Sections: Overview, Detailed content (prose), Key service areas (icon cards), Gallery (`PremiumGallery`), FAQs (`ServiceFaqAccordion`), Related projects (mini project cards), inline CTA
- Sidebar: Quick info, contact CTA, company profile PDF (Site Settings), related services
- `BreadcrumbList` + `Service` JSON-LD (includes image when available)

## Projects Pages Changes

### `/projects`
- Full-width hero with green overlay
- Filter tabs: All, Engineering, Agriculture, Industrial Automation (`ProjectsCatalog`)
- Full-image project cards with gradient overlay (homepage-style), group badge, metadata, View Details CTA
- Bottom CTA

### `/projects/group/[group]`
- Group hero, breadcrumbs, group description
- Same project card system
- Invalid slug → `404` (via `getProjectGroupFromSlug`)
- `BreadcrumbList` JSON-LD

### `/projects/[slug]`
- Case-study hero with metadata chips (client, location, discipline, commissioning)
- Main + sticky sidebar layout
- Sections: Overview, HTML content, Scope, Scope items, Services provided, Technologies, Outcomes (equal-height cards), Gallery, Linked services (mini cards), CTA
- Sidebar: Project details card + contact CTAs
- `BreadcrumbList` + `CreativeWork` JSON-LD

## Detail Page Improvements

- Corporate service page layout (not blog-like)
- Premium case-study project layout with structured icon/numbered cards
- CSS-only animations: `homepage-section-reveal`, `homepage-card-rise`, hover lift, image zoom, CTA arrow shift
- FAQ accordion with smooth height transition (client component)

## SEO Behavior

- Listing metadata preserved/enhanced via `buildMetadata`
- Detail pages use existing `getServiceSeoMetadata` / `getProjectSeoMetadata`
- JSON-LD: `BreadcrumbList`, `Service`, `CreativeWork` with optional `image` / `datePublished` / `locationCreated`
- Sitemap/robots unchanged

## Responsive QA

- Desktop: 3-column grids, sticky sidebars
- Tablet: 2-column grids
- Mobile: single column, stacked sidebars, readable hero text
- Equal-height cards via flex/grid stretch
- No intentional horizontal overflow

## Manual Tests

| Route | Check |
|-------|--------|
| `/services` | Hero, tabs, cards, CTA |
| `/services/[slug]` | Hero, sidebar, gallery, FAQ, related |
| `/services/group/engineering` | Group hero, cards, 404 on invalid |
| `/projects` | Hero, tabs, image cards |
| `/projects/group/engineering` | Group page |
| `/projects/group/agriculture` | Group page |
| `/projects/group/industrial-automation` | Group page |
| `/projects/[slug]` | Case study layout, sidebar, gallery |

Draft/archived content excluded by existing `status: "published"` queries. Homepage, About, Careers, Contact, admin CMS, and `src/proxy.ts` were not modified.

## Lint / Build Status

- `npm run lint` — pass
- `npm run build` — pass (MongoDB Atlas DNS `ECONNREFUSED` during SSG is environmental; fallbacks return empty data)

## New Shared Components

- `src/components/public/catalog/CatalogHero.tsx`
- `src/components/public/catalog/DetailHero.tsx`
- `src/components/public/catalog/CatalogBottomCta.tsx`
- `src/components/public/catalog/PremiumGallery.tsx`
- `src/components/public/catalog/JsonLdScripts.tsx`
- `src/components/public/services/ServiceCard.tsx`
- `src/components/public/services/ServicesCatalog.tsx`
- `src/components/public/services/ServiceDetailView.tsx`
- `src/components/public/services/ServiceFaqAccordion.tsx`
- `src/components/public/projects/ProjectCard.tsx`
- `src/components/public/projects/ProjectsCatalog.tsx`
- `src/components/public/projects/ProjectDetailView.tsx`
- `src/lib/catalog-public.ts`

## Lib Helpers Added

- `getServiceGroup`, `getRelatedPublishedServices` (`src/lib/services.ts`)
- `getProjectsLinkedToService` (`src/lib/projects.ts`)
