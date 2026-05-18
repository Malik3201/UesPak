# Phase 4 — Jobs CMS & SEO Manager Report

## Jobs CMS Implementation

- **Model:** `src/models/Job.ts` — full job schema with enums, arrays, application fields, per-job SEO, status, featured, order, audit fields.
- **Validator:** `src/validators/job.validator.ts` — create/update validation with slug auto-generation support.
- **Types:** `src/types/job.ts` — DTOs, enums, label maps.
- **Lib:** `src/lib/jobs.ts` — published/featured queries, slug generation, card mapping, async SEO metadata builder.
- **Admin API:**
  - `GET/POST /api/admin/jobs`
  - `GET/PATCH/DELETE /api/admin/jobs/[id]` (soft archive)
- **Admin UI:** list with search, status/department filters, pagination; full form with Basic Info, Content, Application, SEO sections.
- **Media folder:** `MEDIA_UPLOAD_FOLDERS.jobs` → `/uespak/jobs`

## Admin Job Routes

| Route | Purpose |
|-------|---------|
| `/admin/jobs` | List, filter, archive |
| `/admin/jobs/new` | Create draft/published job |
| `/admin/jobs/[id]` | Edit existing job |

Sidebar **Jobs** link enabled (no longer placeholder).

## Public Careers Integration

- **`/careers`** — new **Open Positions** section via `CareersOpenPositions`:
  - Published jobs in responsive card grid (featured first)
  - View Details + Apply Now when `applyUrl` / `applyEmail` exist
  - Fallback CTA when no jobs (mailto careers email from page CTA or site primary email)
- **Components:** `JobCard.tsx`, `CareersOpenPositions.tsx`

## Job Detail Page

- **Route:** `/careers/[slug]` (`src/app/(public)/careers/[slug]/page.tsx`)
- **View:** `JobDetailView.tsx` — premium hero, breadcrumbs, overview, responsibilities, requirements, benefits, skills, application instructions, sticky summary sidebar with Apply + Back to Careers
- **SEO:** `generateMetadata` from job SEO with SEO Manager fallbacks
- **JSON-LD:** `BreadcrumbList` + `JobPosting` when sufficient fields exist
- Draft/archived/not found → 404 via `notFound()`

## SEO Manager Implementation

- **Model:** `src/models/SeoSetting.ts` — singleton document (`seo-settings` key)
- **Validator:** `src/validators/seo-setting.validator.ts`
- **Types:** `src/types/seo-setting.ts`
- **Constants:** `src/constants/seo-settings.ts`
- **Lib:** `src/lib/seo-settings.ts` — `getSeoSettings`, `getSeoDefaults`, `buildPageMetadata`, `getCanonicalUrl`, `shouldNoIndexPath`, cache
- **API:** `GET/PATCH /api/admin/seo`
- **Admin UI:** `/admin/seo` + `SeoManagerForm.tsx` (5 sections + overview notes)
- Sidebar **SEO Manager** link enabled

## SEO Settings Fields

Site name/URL, canonical base, default meta title/description/keywords, default OG title/description/image, Twitter card, robots index/follow, sitemap/robots.txt toggles, noindex paths, Google/Bing verification, GA/GTM IDs.

## Sitemap / Robots Behavior

- **`src/app/sitemap.ts`** — dynamic: static pages, service/project group pages, published service/project/job detail URLs; respects `sitemapEnabled`; uses `resolveSiteBaseUrl`; DB errors → static pages only.
- **`src/app/robots.ts`** — allow public, disallow admin/api/_next + configured `noIndexPaths`; sitemap URL when enabled; full disallow when `robotsTxtEnabled` is false.

## Metadata Fallback Behavior

1. **Page-level SEO** (home, services, projects, team, jobs, CMS pages) remains primary.
2. **SEO Manager** (`getSeoSettings`) fills gaps for root layout (`mergeRootSiteMetadata`), CMS pages (`getPageSeoMetadata`), and job detail (`getJobSeoMetadata`).
3. **Site Settings SEO** still applies first at root; SEO Manager supplements missing fields.
4. **Hardcoded constants** used when DB unavailable (build-safe).

Verification meta tags (Google/Bing) injected via root `generateMetadata` when configured. GA/GTM IDs stored but not injected in layout (avoid SSR complexity); can be added later via a small client analytics component.

## Manual Tests

| Area | Status |
|------|--------|
| Admin jobs CRUD flow | Ready for QA in browser |
| Public careers listing + detail | Ready for QA |
| Admin SEO save/load | Ready for QA |
| Sitemap/robots routes | Build generates `/sitemap.xml`, `/robots.txt` |
| Regression routes | Build includes all major public/admin routes |
| DB unavailable at build | Build succeeded with connection errors logged, graceful empty slugs |

## Lint / Build Status

- `npm run lint` — **pass**
- `npm run build` — **pass** (MongoDB unreachable during build; static generation completed with fallbacks)

## Next Recommended Work

1. **Redirects** admin module
2. **Admin Users** management
3. Optional **GA/GTM** script injection component using SEO Manager IDs
4. Warm `getSeoSettings()` in other `generateMetadata` entry points for accurate fallbacks on first request
