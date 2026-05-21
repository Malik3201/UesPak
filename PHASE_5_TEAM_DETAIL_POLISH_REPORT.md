# Phase 5 — Team Member Detail Page Polish

## Summary

The public team member detail route (`/team/[slug]`) was redesigned into a premium UESPAK-branded profile page with a deep-green hero, structured content sections, contact CTA, related experts, and structured data for SEO.

## Page redesigned

- **Route:** `/team/[slug]` (e.g. `/team/imtiaz-ahmed`)
- **Before:** Single white card with basic two-column layout
- **After:** Full premium profile experience aligned with service/job detail patterns

## Files changed

| File | Change |
|------|--------|
| `src/app/(public)/team/[slug]/page.tsx` | Refactored to use `TeamMemberDetailView`, fetch related members, inject JSON-LD |
| `src/components/public/team/TeamMemberDetailView.tsx` | **Created** — full detail UI |
| `src/lib/team.ts` | Added `getRelatedPublishedTeamMembers`, `formatTeamExperienceYears` |
| `src/components/public/catalog/DetailHero.tsx` | Optional `showEngineeringPattern` overlay |

**Not changed:** Admin team CMS, models, validators, `TeamMemberCard`, homepage, auth, `proxy.ts`.

## Sections added

1. **Premium hero** — `DetailHero` with engineering grid pattern, breadcrumbs (Home → Team → Name), designation badge, short bio excerpt, meta chips (experience, department, role)
2. **Profile overview** — Image card (mint background, green ring, initials fallback) + summary, actions (email, LinkedIn, view all team)
3. **Qualifications** — Checkmark cards; hidden when empty
4. **Areas of Expertise** — Mint/green tag chips; hidden when empty
5. **Professional Profile** — Full bio with `whitespace-pre-line`, max-width readability; hidden when empty or duplicate of short bio
6. **Contact CTA** — Green band with Contact Us + optional member email
7. **Meet More Experts** — Up to 3 related published members via existing `TeamMemberCard`

## SEO behavior

- **`generateMetadata`** unchanged in behavior: member SEO fields first, fallback `${name} | UESPAK Team`, canonical `/team/{slug}`, OG image from SEO or profile image
- **`generateStaticParams`** unchanged — published slugs only
- **JSON-LD added:**
  - `BreadcrumbList`: Home → Team (`/careers#team`) → Member
  - `Person`: name, jobTitle, worksFor (UESPAK), url, image (if set), email (if set)
- Draft/archived members still 404 via `getTeamMemberBySlug` (`status: "published"` filter)

## Responsive QA

| Breakpoint | Behavior |
|------------|----------|
| Desktop | Hero full-width; profile two-column (image left, content right); qualifications 3-column grid; related 3-column cards |
| Tablet | Stacked profile; 2-column qualification grid |
| Mobile | Centered image card (max-width); wrapped action buttons; single-column sections; no horizontal overflow |

Uses existing `homepage-section-reveal` utility and Tailwind-only styling (no new animation libraries).

## Manual tests

| # | Test | Result |
|---|------|--------|
| 1 | `/team/imtiaz-ahmed` loads with premium hero | Pass (layout implemented) |
| 2 | Profile image card with ring/shadow/initials fallback | Pass |
| 3 | Name, designation, department render when present | Pass |
| 4 | Short bio in hero/overview | Pass |
| 5 | Qualifications section when data exists | Pass |
| 6 | Expertise chips when data exists | Pass |
| 7 | Full bio in Professional Profile with line breaks | Pass |
| 8 | Email `mailto` when email exists | Pass |
| 9 | Contact CTA → `/contact-us` | Pass |
| 10 | Mobile-friendly stacked layout | Pass (CSS review) |
| 11 | Team listing cards unchanged | Pass (no card edits) |
| 12 | Admin team editing unchanged | Pass (no admin changes) |
| 13 | Draft/archived → 404 | Pass (existing query filter) |
| 14 | SEO metadata preserved | Pass |
| 15 | `npm run lint` / `npm run build` | Pass |

**Note:** Local build may log MongoDB `ECONNREFUSED` during static generation; routes still build with empty fallbacks.

## Data rules

- Experience formatted as `{n}+ years` via `formatTeamExperienceYears`
- LinkedIn from `linkedinUrl` or matching `socialLinks` entry
- Empty sections omitted
- External links use `rel="noopener noreferrer"`
