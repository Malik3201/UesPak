# Phase 3 Home CMS Persistence Fix Report

## Root Cause

HomePage media persistence was fragile in two places:

- The HomePage PATCH route validated the request with `homePageUpdateSchema = homePageSchema.partial()` and then used that parsed result as the update patch. Because nested schemas define defaults, Zod can materialize empty nested sections/arrays during partial parsing. Those defaulted values can overwrite existing nested media when merged.
- The HomePage media validator still required `publicId` or `fileId`. ImageKit media can be represented safely by URL plus optional metadata, so URL-only media objects were at risk of validation failure or being filtered out during load/serialization.

## Fields Affected

- `hero.backgroundImages`
- `hero.backgroundImage`
- `featuredServices.backgroundImage`
- `servicesOverview.image`
- `aboutPreview.image`
- `visionMission.image`
- `seo.ogImage`
- `clients.logos[].logo`

## Files Changed

- `src/components/admin/home/HomePageForm.tsx`
- `src/app/api/admin/home/route.ts`
- `src/validators/home-page.validator.ts`
- `src/lib/home-page.ts`

## Persistence Chain Fix

- Admin media upload handlers now normalize HomePage media consistently before writing into the actual saved form state.
- HomePage PATCH now merges raw incoming request data into defaults and the existing MongoDB document first, then validates the final merged document with `homePageSchema`.
- The PATCH route no longer treats Zod-generated nested defaults as intentional client updates.
- Mongoose update now runs schema validators with `runValidators: true`.
- Media validation now requires only `url`; `publicId`, `fileId`, and `altText` are safely defaulted.
- Admin/API/public load filtering now preserves media objects that have a URL even if ImageKit ID metadata is missing.

## Tests Performed

- Targeted validator check confirmed URL-only media persists through `homePageSchema` for:
  - `hero.backgroundImages`
  - `featuredServices.backgroundImage`
  - `aboutPreview.image`
  - `seo.ogImage`
- IDE lints for edited files returned clean.
- `npm run lint` passed.
- `npm run build` passed. The local environment still reports MongoDB Atlas `ECONNREFUSED` messages during static generation, but Next.js completed the production build successfully.

## Notes

The fix does not store binary data in MongoDB. Only ImageKit metadata and URLs are persisted.
