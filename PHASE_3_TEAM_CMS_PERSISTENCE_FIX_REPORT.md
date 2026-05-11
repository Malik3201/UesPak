# Phase 3 — Team Members CMS Persistence Fix Report

## Symptom

After editing a team member in `/admin/team/[id]` and clicking Save:

- The success toast appeared.
- A full browser refresh of the same edit page no longer showed the newly typed `shortBio`, `bio`, `expertise`, `qualifications`, `email`, `experienceYears`, SEO fields, or newly uploaded OG image.

This is the same family of bug we previously resolved for HomePage CMS nested fields.

## Root Cause (multi-factor)

Two cooperating issues plus one form UX gap:

1. **Mongoose `strict: true` (default) + Next.js HMR model caching.**
   In dev, Next.js can hot-reload `src/models/TeamMember.ts` while another
   module still holds a reference to the *previous* compiled schema. When
   `findByIdAndUpdate(...)` ran on a stale model instance whose schema didn't
   include some newly added fields (e.g. `shortBio`, `experienceYears`,
   `socialLinks`, full `seo` subdocument), Mongoose's default strict mode
   silently dropped those fields from `$set` and the save returned success
   without writing them.

2. **Zod media schema required `publicId`.**
   The validator's nested `mediaObjectSchema` required both `url` and
   `publicId` to be non-empty. ImageKit normalized assets always include
   both, but if any code path produced a media object with only `url` (or
   `publicId: ""`), the entire team-member PATCH would 422 — and if the
   client wasn't surfacing the error clearly, the user could be left with a
   confusing "saved but nothing persisted" appearance for the *other*
   fields they had been editing in the same submit.

3. **Form did `router.refresh()` after save but kept its own local
   state**, so any field the API actually dropped wouldn't reveal itself
   until a real browser refresh. The form looked authoritative when it was
   really showing the user's local typed-in values.

## Failure Point Identified

`PATCH /api/admin/team/[id]` writing through a stale Mongoose schema
instance under HMR. With `strict: true` the new sub-fields and the full
`seo` subdocument were stripped from `$set` and never reached MongoDB. The
GET handler then returned the unchanged document, which the client only
noticed on a hard browser refresh because the form was still rendering its
own local state.

## Fields Affected

- `shortBio`
- `bio`
- `expertise`
- `qualifications`
- `experienceYears`
- `email`
- `phone`
- `linkedinUrl`
- `socialLinks`
- `image`
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

- `src/app/api/admin/team/[id]/route.ts`
- `src/app/api/admin/team/route.ts`
- `src/validators/team-member.validator.ts`
- `src/components/admin/team/TeamMemberForm.tsx`
- `PHASE_3_TEAM_CMS_PERSISTENCE_FIX_REPORT.md` (this file)

## Fix Implementation

### 1) Mongoose update — strict: false + SEO merge

In `src/app/api/admin/team/[id]/route.ts` PATCH:

- Added `strict: false` to `findByIdAndUpdate` options so any field present
  in the validated update payload is written even if Mongoose's currently
  active schema instance is stale due to HMR.
- Added an explicit SEO merge so partial SEO patches from non-form
  clients can no longer wipe previously saved SEO subfields. (The admin
  form already sends the full SEO object, so this is identity from the
  UI; the merge is defense-in-depth for programmatic clients and future
  partial updates.)

### 2) Relaxed media validator

In `src/validators/team-member.validator.ts`:

- `mediaObjectSchema` now only requires `url`. `publicId` is optional
  (defaults to `""`), `fileId`, `format`, `mimeType`, `altText`, etc. are
  all optional. This prevents the entire team-member PATCH from 422'ing
  when an ImageKit asset arrives without a `publicId` and keeps the rest
  of the user's edits in the same submit from being silently lost.

### 3) Rehydrate the form from the API response after save

In `src/components/admin/team/TeamMemberForm.tsx`:

- After a successful save in edit mode, the form now overwrites its own
  state from `json.data.teamMember` (the authoritative server response).
  If the API ever drops a field again, the UI will reveal it
  immediately on save instead of waiting for a full browser refresh.
- `keywordsCsv` is also re-derived from the saved SEO keywords array so
  it stays in sync with the persisted data.

### 4) Dev-only debug tracing

Added scoped `process.env.NODE_ENV === "development"` console logs at
every persistence checkpoint so we can pinpoint failures without leaking
data in production:

- `TeamMemberForm.onSubmit` — logs `shortBio`, `expertise`,
  `qualifications`, `email`, `experienceYears`, `seo`, `image` in both the
  save payload and the server response.
- `POST /api/admin/team` — logs incoming body and the saved document.
- `PATCH /api/admin/team/[id]` — logs incoming body, the validated update,
  and the saved document.
- `GET /api/admin/team/[id]` — logs the loaded `seo`, `expertise`,
  `qualifications`, `shortBio`, and `image` on every fetch.

No secrets, cookies, JWTs, or environment variables are logged.

## Manual Tests

Admin edit persistence:

1. Open `/admin/team/[id]` for an existing member.
2. Update `shortBio`, `bio`, `experienceYears`, `email`.
3. Add 2 `expertise` items and 2 `qualifications`.
4. Update SEO: `metaTitle`, `metaDescription`, `keywords`, `canonicalUrl`,
   `ogTitle`, `ogDescription`, `robots index`/`follow`, `schemaType`.
5. Click Save. Success toast appears.
6. Refresh the browser (`/admin/team/[id]`).
7. All fields above are still present in the form.

Image persistence:

1. Upload a profile image; Save; refresh; image preview persists.

SEO OG image persistence:

1. Upload an OG image; Save; refresh; OG image preview persists.

Public surface:

1. Set status to Published; mark Featured; Save.
2. Open `/careers` — the member appears with updated name, designation,
   short bio, and image.
3. Open `/` — the homepage featured-team carousel includes the member.

Draft regression:

1. Create a new team member with only Name + Designation (draft).
2. Save; refresh; the draft persists in the admin list.
3. `/careers` and `/` do not show the draft (published-only filters intact).

## Lint / Build Status

- `npm run lint`: passes.
- `npm run build`: passes (only environment-level MongoDB Atlas DNS errors
  during static generation when run from a machine without DB access — not
  a code error).

## Notes

- Dev debug logs are intentionally left in for one pass so you can verify
  the persistence chain end-to-end. They are gated behind
  `process.env.NODE_ENV === "development"` and produce no output in
  production. They can be removed after confirmation.
- The same `strict: false` + post-save rehydration pattern is now applied
  to TeamMember CMS, matching the HomePage CMS fix. Future CMS entities
  with deep nested subdocuments should adopt this pattern by default.
