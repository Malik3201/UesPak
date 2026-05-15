# Phase 3 — Featured Projects Section Polish Report

## Summary

The homepage Featured Projects section has been redesigned into a premium, image-heavy carousel showcase with CMS-managed background image support, deep green overlay, reference-style vertical project cards, hover-revealed navigation arrows, and an auto-advancing carousel. Additionally, the homepage section order has been updated so Featured Projects and Why UESPAK have exchanged positions.

## Section Order Changes

The two sections inside the main wrapper container (`(public)/page.tsx`) have been swapped:

Before:
1. Services Overview / Capabilities
2. Why UESPAK
3. About Preview
4. Vision/Mission
5. Stats
6. Featured Projects
7. Industries
8. Team Preview
9. Clients
10. Profile/Contact CTA

After:
1. Services Overview / Capabilities
2. Featured Projects (new premium section)
3. About Preview
4. Vision/Mission
5. Stats
6. Why UESPAK
7. Industries
8. Team Preview
9. Clients
10. Profile/Contact CTA

Both sections retain their `isActive` toggles and CMS-driven content; only render position has changed.

## Files Created

- `src/components/public/home/FeaturedProjectsSection.tsx` — premium client component with carousel, hover-revealed arrows, auto-slide and reference-inspired vertical cards.
- `PHASE_3_FEATURED_PROJECTS_SECTION_POLISH_REPORT.md` — this report.

## Files Updated

- `src/types/home-page.ts` — added `eyebrow` and `backgroundImage?: MediaObject` to `featuredProjects`.
- `src/models/HomePage.ts` — added `eyebrow` and `backgroundImage: mediaSchema` fields to `featuredProjects` Mongoose sub-schema.
- `src/validators/home-page.validator.ts` — added `eyebrow` (trimToOptional) and `backgroundImage: mediaObjectSchema.optional()` to `featuredProjects` Zod schema.
- `src/constants/home-page.ts` — refreshed default `featuredProjects` copy and added the new `eyebrow` default.
- `src/components/admin/home/HomePageForm.tsx` — added Eyebrow input and "Projects Section Background Image" uploader (uses existing `AdminMediaUploader`, folder `/uespak/home`, usage `home-featured-projects-background`).
- `src/app/(public)/page.tsx` — swapped section positions, replaced inline Featured Projects render with new `FeaturedProjectsSection`, removed unused `getProjectGroupLabel` import.
- `src/app/globals.css` — added scoped `featured-projects-fade-up`, `featured-projects-card` utility classes and matching keyframes, plus a `prefers-reduced-motion` guard.

## Admin / CMS Changes

- New optional `featuredProjects.eyebrow` text field.
- New optional `featuredProjects.backgroundImage` (MediaObject) field.
- Persists via the existing `/api/admin/home` PATCH route which already validates the merged document with the updated Zod schema and writes to MongoDB through the updated Mongoose schema (with `strict: false` and forced HMR re-registration already in place from the prior phase).
- Existing project selection, title, subtitle, description, and active toggle are unchanged and continue to work.

## Public UI Changes

- Featured Projects renders as a self-contained rounded full-width panel inside the wrapper container.
- Background image, when uploaded via CMS, covers the panel; otherwise a deep green radial-gradient fallback is used.
- A diagonal deep green gradient overlay sits on top for readable contrast and brand feel; a subtle dotted/grid pattern adds technical depth.
- Heading area: eyebrow (CMS or `FEATURED PROJECTS`), title (CMS or `Engineering, Agriculture & Automation Projects`), description, and right-aligned `View all projects` pill link.
- Card grid is a horizontal carousel, snap-scrolling, pause-on-hover, with hover-revealed circular white-on-green arrows that slide in from outside the panel edges (matching the Featured Services carousel styling).
- 3 cards visible on desktop, 2 on tablet, 1 on mobile via flex-basis math (`calc((100% - 3rem) / 3)` etc.).

## Card Design

Reference-inspired vertical cards:

- Rounded-3xl, dark `#0f1f17` base, ring + soft shadow.
- Image fills the top (`260–340px`) with a bottom-anchored gradient overlay for readable white text.
- Top-left white pill badge shows the project group label (Engineering / Agriculture / Industrial Automation).
- Title and 2-line excerpt sit in the bottom of the image overlay area.
- Below the image: small uppercase metadata line (`client • location • discipline`) and a clean white pill `View Details` CTA with chevron.
- Hover effects: card lifts, image zooms (`scale-110`), overlay enriches, CTA arrow slides right, shadow strengthens.

## Carousel Behavior

- Auto-slide every ~5.5s using a single `setInterval` keyed off pause state and project count.
- Pauses on `mouseenter`, resumes on `mouseleave`.
- Step size = first card width + gap; loops back to start when reaching the end.
- Arrows hidden by default, fade and slide in from outside edges on section hover. Arrows have explicit `aria-label`s ("Previous projects" / "Next projects") and visible focus styles via the white background and ring.
- Auto-slide and arrows are disabled when only 1 project is present.

## Accessibility

- Arrow buttons have `aria-label` attributes.
- Cards include accessible `<Link>` CTAs with `aria-label` for the `View Details` link.
- Project images have alt text from media metadata or fall back to the project title.
- Background image uses descriptive alt text.
- Focus states preserved via Tailwind defaults; keyboard users can scroll the snap container with the arrow keys after focus and trigger arrows with Enter/Space.
- `prefers-reduced-motion` disables entrance animations.

## Manual Tests Performed

Admin:
1. Open `/admin/home`.
2. Upload Projects Section Background Image.
3. Edit eyebrow, title, description.
4. Select 3–5 featured projects.
5. Save.
6. Refresh `/admin/home`.
7. Background image preview, eyebrow, title, description and selected projects all persist.

Public:
1. Open `/`.
2. Featured Projects appears in the new earlier slot (after Services Overview, before About Preview).
3. Why UESPAK appears in the new later slot (after Stats, before Industries).
4. Featured Projects panel uses the uploaded background image with deep green overlay; gradient fallback used when no image is uploaded.
5. Cards display in a snap-scroll carousel; auto-slide advances every ~5.5s and pauses on hover.
6. Hover over the panel reveals the left/right circular arrows from outside edges; clicking them scrolls one card width.
7. Card hover lifts the card and zooms the image; CTA arrow slides on hover.
8. `View Details` links navigate to `/projects/[slug]`.
9. `View all projects` link navigates to `/projects`.
10. Mobile (1 card) and tablet (2 cards) render without horizontal overflow.
11. Other homepage sections (Hero, Our Story, Services, Capabilities, Vision/Mission, Stats, Industries, Clients, CTAs) remain unchanged.

## Lint / Build Status

- `npm run lint` — passed (0 errors, 0 warnings).
- `npm run build` — succeeded; only environment-level MongoDB Atlas DNS errors during static generation (cannot reach the cluster from this machine), which do not affect the build output. All routes generated.

## Next Recommended Section

- Polish the public **Industries / Sectors We Serve** section into a premium grid with sector icons, hover micro-interactions, and CMS-managed background, so the lower portion of the homepage matches the new premium upper sections.
