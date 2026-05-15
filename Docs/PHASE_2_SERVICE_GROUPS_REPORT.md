# Phase 2 — Service Groups (Engineering vs Agriculture)

## Summary
The Services CMS now supports a **top-level business grouping** via `serviceGroup`, allowing UESPAK services to be managed and presented as:

- **Engineering Services** (`engineering`)
- **Agriculture Services** (`agriculture`)

This replaces the old “Agriculture Services is a static page” concept with **dynamic CMS-managed service records**, while keeping existing `/services/[slug]` URLs fully compatible.

## Why this change
- **Business alignment**: Services are clearly split into Engineering vs Agriculture.
- **Scalability**: Agriculture services can now be created/edited/published like any other service.
- **Better admin UX**: Clear group selection + filtering.
- **SEO-ready structure**: Public listings and optional group pages are stable and indexable.

## Implementation details

### Data model
- Added `serviceGroup: "engineering" | "agriculture"` to `Service`
- **Default**: `"engineering"` (backward compatible)
- Existing Service documents that don’t have `serviceGroup` behave as `engineering`
- Added index on `serviceGroup` for filtering

### Admin behavior
- Admin create/edit includes a **Service Group** dropdown.
- Admin services list shows a **Group badge** and includes a **Service Group filter**.
- Admin API supports `GET /api/admin/services?serviceGroup=engineering|agriculture`.

### Public behavior
- `/services` now renders **two grouped sections**:
  - Engineering Services
  - Agriculture Services
- Added group listing pages:
  - `/services/group/engineering`
  - `/services/group/agriculture`
- Individual service URLs remain unchanged:
  - `/services/[slug]`
- Service detail breadcrumbs now include the group:
  - Home → Services → (Engineering/Agriculture) → Service

### Navigation
- Public navbar “Services” is now a **professional dropdown**:
  - Engineering Services (links + view all)
  - Agriculture Services (links + view all)
  - View All Services
- It uses published services only and degrades gracefully (no crash) if the DB is unavailable.

## Files created
- `src/app/(public)/services/group/[group]/page.tsx`
- `scripts/seed-agriculture-services.ts`
- `PHASE_2_SERVICE_GROUPS_REPORT.md`

## Files updated
- `src/models/Service.ts`
- `src/types/service.ts`
- `src/validators/service.validator.ts`
- `src/lib/services.ts`
- `src/app/api/admin/services/route.ts`
- `src/app/api/admin/services/[id]/route.ts`
- `src/components/admin/services/ServiceForm.tsx`
- `src/components/admin/services/ServicesTable.tsx`
- `src/components/admin/services/ServicesPageClient.tsx`
- `src/app/admin/(authenticated)/services/[id]/page.tsx`
- `src/app/(public)/services/page.tsx`
- `src/app/(public)/services/[slug]/page.tsx`
- `src/components/public/Navbar.tsx`
- `package.json`

## API changes

### Admin
- `GET /api/admin/services`
  - Added optional query param: `serviceGroup=engineering|agriculture`
- `POST /api/admin/services`
  - Accepts `serviceGroup` (defaults to `engineering`)
- `PATCH /api/admin/services/[id]`
  - Accepts `serviceGroup` (optional)

## Seed script (optional)
Creates **draft** Agriculture services (no images, not published).

Run:

```bash
npm run seed:agriculture-services
```

Behavior:
- Creates draft services for:
  - Agricultural Training, Regenerative Farming, Organic Crop Production, Edible Food Forest, Syntropic Farming, Permaculture Designing, Rainwater Harvesting, Livestock, Agricultural Engineering, Home Gardening, Landscaping
- Skips any service where the slug already exists.

## Manual testing checklist

### Admin
- Login → `/admin/services`
- Create service:
  - Title: Agricultural Training
  - Service Group: Agriculture Services
  - Status: Draft
- Save → refresh → confirm `serviceGroup` persists
- Filter list by Agriculture Services → confirm it appears
- Edit and switch group to Engineering → save → confirm change

### Public
- Draft agriculture services do not show on `/services`
- Publish an agriculture service → it appears under **Agriculture Services**
- `/services/[slug]` detail page works
- Existing service detail URLs continue to work

### Navigation
- Services dropdown shows Engineering/Agriculture + View all
- Mobile layout unchanged and not broken

## Next recommended work
- Add **Project Categories + Projects CMS**
- Extend Services with optional **subcategory taxonomy** (still not a full category CMS unless needed)

