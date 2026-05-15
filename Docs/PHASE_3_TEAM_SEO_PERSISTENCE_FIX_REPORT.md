# Phase 3 — Team SEO Persistence Fix Report

## Root Cause

Team Member SEO data was reaching the form and PATCH route, but it was not
reliably surviving the database write/load cycle. The failure was specific to
the nested `seo` object.

The main causes were:

- The TeamMember model used the shared `AdminUser.mediaSchema` for image fields.
  That schema requires `publicId`, while team SEO `ogImage` must accept
  ImageKit metadata where only `url` is guaranteed.
- The TeamMember SEO Mongoose schema did not define defaults for each nested SEO
  subfield, so nested updates could hydrate inconsistently when fields were
  missing or partially supplied.
- PATCH was setting `seo` as a plain nested object. It did not explicitly merge
  `keywords`, `robots`, and `ogImage` with the existing SEO object by type, which
  made partial SEO updates fragile.

## Failure Point

The failure point was the PATCH update/write boundary:

`validated.seo` could contain values, but `updateData.seo` / the Mongo write path
could fail to preserve the nested SEO object consistently, especially with nested
media (`ogImage`) and partial SEO payloads.

## Fields Fixed

- `seo.metaTitle`
- `seo.metaDescription`
- `seo.keywords`
- `seo.canonicalUrl`
- `seo.ogTitle`
- `seo.ogDescription`
- `seo.ogImage`
- `seo.robots.index`
- `seo.robots.follow`
- `seo.schemaType`

## Files Changed

- `src/models/TeamMember.ts`
- `src/validators/team-member.validator.ts`
- `src/app/api/admin/team/[id]/route.ts`
- `src/app/api/admin/team/route.ts`
- `src/components/admin/team/TeamMemberForm.tsx`
- `src/lib/team.ts`

## Fix Details

### Mongoose Schema

`src/models/TeamMember.ts` now uses a local `mediaObjectSchema` for team image and
SEO OG image fields. This schema only requires `url` and allows optional:

- `publicId`
- `fileId`
- `altText`
- `width`
- `height`
- `format`
- `size`
- `mimeType`

The TeamMember `seoSchema` now explicitly defines defaults for all SEO fields:

- empty strings for text fields
- `[]` for `keywords`
- `{ index: true, follow: true }` for `robots`
- `"Person"` for `schemaType`

### Validator

`src/validators/team-member.validator.ts` now allows URL-only media objects and
keeps `seo` explicitly in create/update validation. `ogDescription` is capped at
180 characters to match the intended SEO limit.

### PATCH Route

`src/app/api/admin/team/[id]/route.ts` now:

- logs the SEO chain in development using `[TEAM SEO DEBUG]`
- merges incoming SEO with existing SEO
- preserves empty keyword arrays using `Array.isArray`
- preserves false robot booleans using nullish checks
- preserves existing `ogImage` when an incoming PATCH omits it
- writes with `{ $set: updatePayload }`
- uses `{ new: true, runValidators: true, strict: false }`

### Form

`src/components/admin/team/TeamMemberForm.tsx` now logs:

- `FORM payload.seo`
- server response `teamMember.seo`
- loaded `initialMember.seo`

The form already converts keywords CSV to `seo.keywords` before save and
re-hydrates local state from the server response after save.

### Public Helper

`src/lib/team.ts` now includes `getTeamSeoMetadata(member)` so the public detail
page/helper layer has a single preserved SEO shape to consume.

## Debug Proof Points

In development, the following logs prove each persistence checkpoint:

- `[TEAM SEO DEBUG] FORM payload.seo:`
- `[TEAM SEO DEBUG] API incoming body.seo:`
- `[TEAM SEO DEBUG] validated.seo:`
- `[TEAM SEO DEBUG] updateData.seo before DB save:`
- `[TEAM SEO DEBUG] full updateData keys:`
- `[TEAM SEO DEBUG] savedTeamMember.seo:`
- `[TEAM SEO DEBUG] GET teamMember.seo:`
- `[TEAM SEO DEBUG] loaded teamMember.seo into form:`

## Manual Test Plan

1. Open existing `/admin/team/[id]`.
2. Fill:
   - Meta title
   - Meta description
   - Keywords CSV
   - Canonical URL
   - OG title
   - OG description
   - OG image
   - Robots index/follow
   - Schema type `Person`
3. Save.
4. Confirm PATCH response/log contains `seo`.
5. Refresh `/admin/team/[id]`.
6. Confirm all SEO fields still show.
7. Confirm non-SEO fields still persist.
8. Confirm `/careers` and homepage featured team still render.

## Lint / Build Status

To be completed after verification:

- `npm run lint`
- `npm run build`
