# Phase 3 — Team Members CMS Report

## Summary

Implemented a complete Team Members CMS for UESPAK with admin CRUD, ImageKit profile photo uploads, draft/published/archived workflow, featured team support, public Careers page team display, homepage featured team carousel, and optional public team member profile pages.

## Files Created

- `src/types/team.ts`
- `src/validators/team-member.validator.ts`
- `src/lib/team.ts`
- `src/app/api/admin/team/route.ts`
- `src/app/api/admin/team/[id]/route.ts`
- `src/app/admin/(authenticated)/team/page.tsx`
- `src/app/admin/(authenticated)/team/new/page.tsx`
- `src/app/admin/(authenticated)/team/[id]/page.tsx`
- `src/components/admin/team/TeamMembersPageClient.tsx`
- `src/components/admin/team/TeamMembersTable.tsx`
- `src/components/admin/team/TeamMemberForm.tsx`
- `src/components/admin/team/TeamMemberStatusBadge.tsx`
- `src/components/public/team/TeamMemberCard.tsx`
- `src/components/public/careers/CareersTeamSection.tsx`
- `src/components/public/home/HomeTeamSection.tsx`
- `src/app/(public)/team/[slug]/page.tsx`
- `PHASE_3_TEAM_MEMBERS_CMS_REPORT.md`

## Files Updated

- `src/models/TeamMember.ts` — expanded the existing basic model into the full CMS schema.
- `src/components/admin/AdminSidebar.tsx` — enabled the Team Members navigation link.
- `src/app/(public)/careers/page.tsx` — added the published team members section.
- `src/app/(public)/page.tsx` — loads featured team members and renders the homepage team carousel when active.

## API Endpoints

### `GET /api/admin/team`

Lists team members with filters:

- `status`
- `search`
- `page`
- `limit`
- `featured`
- `department`

Sorts by `order ASC`, then `createdAt DESC`.

### `POST /api/admin/team`

Creates a new team member. Requires admin auth, validates request body with Zod, auto-generates a unique slug when needed, sets `createdBy` / `updatedBy`, and sets `publishedAt` when created as published.

### `GET /api/admin/team/[id]`

Returns one team member for the admin editor.

### `PATCH /api/admin/team/[id]`

Updates a team member. Requires admin auth, validates body, ensures slug uniqueness excluding the current document, updates `updatedBy`, and sets/unsets `publishedAt` based on status.

### `DELETE /api/admin/team/[id]`

Soft archives a team member by setting `status: "archived"`; no hard delete is performed.

## Admin Routes

- `/admin/team` — Team Members list with search, status, featured, department filters, pagination, archive action, and empty/loading/error states.
- `/admin/team/new` — Create team member.
- `/admin/team/[id]` — Edit team member.

## Admin Form Features

Form sections:

1. Basic Info
   - Name
   - Slug
   - Designation
   - Department
   - Short bio
   - Full bio
   - Status
   - Order
   - Featured toggle
   - Years of experience
2. Profile Image
   - Uses existing `AdminMediaUploader`
   - Folder: `/uespak/team`
   - Usage: `team-profile`
3. Expertise dynamic array
4. Qualifications dynamic array
5. Contact / Social
   - Email
   - Phone
   - LinkedIn URL
   - Additional social links
6. SEO
   - Meta title
   - Meta description
   - Keywords CSV
   - Canonical URL
   - OG title
   - OG description
   - OG image upload (`/uespak/seo`, usage `team-og`)
   - Robots index/follow
   - Schema type (`Person` default)

Drafts can be saved with only name and designation.

## Public Helpers

`src/lib/team.ts` exports:

- `getPublishedTeamMembers()`
- `getFeaturedTeamMembers()`
- `getTeamMemberBySlug(slug)`
- `getAllTeamSlugs()`
- `serializeTeamMember(member)`

Public helpers only return published members and fail gracefully with empty arrays/null when the DB is unavailable.

## Careers Page Behavior

The Careers page now renders a “Meet Our Professionals” section using all published team members:

- 4 cards on desktop
- 2 cards on tablet
- 1 card on mobile
- white/light background
- modern reference-inspired person cards
- hover state changes non-highlight cards to deep green
- published-only data source
- hidden if no published members exist

## Homepage Featured Team Behavior

The homepage now renders the `teamPreview` section using featured published members:

- `status: "published"`
- `isFeatured: true`
- uses existing HomePage CMS `teamPreview.title`, `teamPreview.description`, and `teamPreview.isActive`
- no arrows
- smooth auto-running snap carousel
- pauses on hover
- 4 cards desktop, 2 tablet, 1 mobile
- hidden if no featured published team members exist
- white/plain background as requested

## Public Team Profile Page

Added optional profile pages at:

- `/team/[slug]`

Only published members are shown. Draft/archived/missing members return 404. The page includes image, designation, bio, expertise, qualifications, and contact/social actions.

## Design Notes

The card design follows the provided second reference style:

- clean white cards
- one highlighted/active card in deep UESPAK green
- prominent portrait image region
- professional typography
- subtle chips for expertise
- smooth lift and color transition hover
- UESPAK green/white theme
- no fake/static members

## Security and Stability

- Admin APIs use `requireAdmin()`.
- Public views only query published members.
- Uploaded images are stored as ImageKit metadata, not binary.
- Request bodies are Zod-validated.
- Helpers return safe fallbacks if DB is unavailable.
- `src/proxy.ts` remains untouched.

## Manual Tests

Admin:

1. Open `/admin/team`.
2. Create team member as Draft with name/designation.
3. Save and refresh; member persists.
4. Upload profile image; save and refresh; image persists.
5. Publish and mark featured; save and refresh.
6. Archive member and verify public helpers no longer show it.

Careers:

1. Open `/careers`.
2. Published team members display.
3. Draft/archived members do not display.
4. Responsive card grid works.

Homepage:

1. Open `/`.
2. Featured team carousel appears only when featured published members exist.
3. Carousel auto-runs with no arrow buttons.
4. Hover pauses carousel.
5. Card hover is smooth and stays on a white section background.

Regression:

1. Header remains functional.
2. Services CMS and public pages remain unchanged.
3. Projects CMS and public pages remain unchanged.
4. Existing homepage sections remain functional.

## Lint / Build Status

To be completed after verification:

- `npm run lint`
- `npm run build`

## Next Recommended Work

Build the Careers Jobs CMS so the Careers page can show live openings alongside the newly managed team profiles.
