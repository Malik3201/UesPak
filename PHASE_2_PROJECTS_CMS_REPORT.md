# Phase 2 — Projects CMS

## What was implemented
- Built a complete Projects CMS for UESPAK with dynamic support for:
  - Engineering Projects
  - Agriculture Projects
  - Industrial Automation
- Added Project Groups as a first-class top-level concept.
- Added Project Categories CMS for classification and filtering.
- Added admin APIs and UI for managing categories and projects.
- Replaced placeholder public projects pages with dynamic grouped listings and detail pages.
- Added project group routes and updated public navbar projects dropdown.

## Why project groups were added
Project groups match UESPAK’s business structure and navigation model. They provide:
- stable top-level routing and menu structure,
- clean admin organization,
- predictable SEO segmentation,
- future scalability for filtering and internal linking.

## Group management model
- `engineering`
- `agriculture`
- `industrialAutomation`

These groups are used consistently across:
- model schemas,
- validators,
- admin forms/lists,
- APIs,
- public pages,
- navigation.

## Files created
- `src/types/project.ts`
- `src/models/ProjectCategory.ts`
- `src/validators/project-category.validator.ts`
- `src/lib/projects.ts`
- `src/app/api/admin/project-categories/route.ts`
- `src/app/api/admin/project-categories/[id]/route.ts`
- `src/app/api/admin/projects/route.ts`
- `src/app/api/admin/projects/[id]/route.ts`
- `src/components/admin/projects/ProjectCategoryStatusBadge.tsx`
- `src/components/admin/projects/ProjectStatusBadge.tsx`
- `src/components/admin/projects/ProjectCategoriesTable.tsx`
- `src/components/admin/projects/ProjectCategoryForm.tsx`
- `src/components/admin/projects/ProjectCategoriesPageClient.tsx`
- `src/components/admin/projects/ProjectsTable.tsx`
- `src/components/admin/projects/ProjectsPageClient.tsx`
- `src/components/admin/projects/ProjectForm.tsx`
- `src/app/admin/(authenticated)/project-categories/page.tsx`
- `src/app/admin/(authenticated)/project-categories/new/page.tsx`
- `src/app/admin/(authenticated)/project-categories/[id]/page.tsx`
- `src/app/admin/(authenticated)/projects/page.tsx`
- `src/app/admin/(authenticated)/projects/new/page.tsx`
- `src/app/admin/(authenticated)/projects/[id]/page.tsx`
- `src/app/(public)/projects/group/[group]/page.tsx`
- `scripts/seed-project-categories.ts`
- `PHASE_2_PROJECTS_CMS_REPORT.md`

## Files updated
- `src/models/Project.ts`
- `src/validators/project.validator.ts`
- `src/components/admin/AdminSidebar.tsx`
- `src/app/(public)/projects/page.tsx`
- `src/app/(public)/projects/[slug]/page.tsx`
- `src/components/public/Navbar.tsx`
- `package.json`

## API endpoints
- `GET /api/admin/project-categories`
- `POST /api/admin/project-categories`
- `GET /api/admin/project-categories/[id]`
- `PATCH /api/admin/project-categories/[id]`
- `DELETE /api/admin/project-categories/[id]` (soft archive)
- `GET /api/admin/projects`
- `POST /api/admin/projects`
- `GET /api/admin/projects/[id]`
- `PATCH /api/admin/projects/[id]`
- `DELETE /api/admin/projects/[id]` (soft archive)

## Admin routes
- `/admin/project-categories`
- `/admin/project-categories/new`
- `/admin/project-categories/[id]`
- `/admin/projects`
- `/admin/projects/new`
- `/admin/projects/[id]`

## Public routes
- `/projects` (grouped listing)
- `/projects/[slug]` (published detail page)
- `/projects/group/engineering`
- `/projects/group/agriculture`
- `/projects/group/industrial-automation`

## SEO behavior
- `/projects` metadata updated for engineering/agriculture/automation intent.
- Group pages include group-specific metadata and canonical paths.
- Project detail pages use project SEO with fallbacks and include:
  - BreadcrumbList JSON-LD
  - CreativeWork JSON-LD
- Draft/archived projects are excluded from public helper queries.

## Seed utility
Script:
- `npm run seed:project-categories`

Behavior:
- Seeds default project categories.
- Skips records where slug already exists.
- Applies sensible default group mapping.

## Manual testing checklist

### Admin
1. Login as admin.
2. Open `/admin/project-categories`.
3. Create/edit/archive category and verify filters.
4. Open `/admin/projects`.
5. Create draft project with minimum fields.
6. Edit project, add media, linked services, and publish.
7. Archive project and confirm status update.

### Public
1. Draft/archived projects do not appear on public pages.
2. Published projects appear under correct group on `/projects`.
3. `/projects/[slug]` works for published records.
4. Invalid slug returns 404.
5. Group pages load correct records.

### Navigation
1. Projects dropdown shows all three groups + view all.
2. Services dropdown still works.
3. Mobile navbar is not broken.

### Build quality
1. Run `npm run lint`
2. Run `npm run build`

## Next recommended work
- Add related-content modules:
  - project ↔ service cross-link surfaces on service detail pages,
  - category landing enhancements,
  - optional projects hero/featured layout controls via CMS settings.

