# Phase 3 Homepage Media + CTA Sections Report

## Scope

Enhanced only the homepage Achievements, Industries, and Profile/Contact CTA sections with CMS-managed background media and final visual polish. Existing Header/Hero, Our Story, Services, Projects, Vision/Mission, Team, auth, `src/proxy.ts`, and CMS modules were preserved.

## Fields Added

### HomePage CMS

- `stats.backgroundImage?: MediaObject`
- `stats.overlayOpacity?: number`
- `industries.backgroundImage?: MediaObject`
- `industries.overlayOpacity?: number`
- `contactCTA.backgroundImage?: MediaObject`
- `contactCTA.overlayOpacity?: number`
- `profileCTA.backgroundImage?: MediaObject`

### Media Metadata

- Preserved `mimeType` in admin upload normalization.
- Preserved `fileId` and `mimeType` in Site Settings validation and shared media schema.

## Files Created

- `PHASE_3_HOMEPAGE_MEDIA_CTA_SECTIONS_REPORT.md`

## Files Updated

- `src/app/(public)/page.tsx`
- `src/app/api/admin/home/route.ts`
- `src/components/admin/home/HomePageForm.tsx`
- `src/components/admin/media/AdminMediaUploader.tsx`
- `src/components/admin/settings/SiteSettingsForm.tsx`
- `src/constants/home-page.ts`
- `src/models/AdminUser.ts`
- `src/models/HomePage.ts`
- `src/types/home-page.ts`
- `src/validators/home-page.validator.ts`
- `src/validators/settings.validator.ts`

## Admin Upload Changes

- Added “Achievements Section Background Image” uploader under Stats/Achievements.
- Added “Industries Section Background Image” uploader under Industries We Serve.
- Added “Contact CTA Background Image” uploader under Contact CTA.
- Added “Profile CTA Background Image” uploader under Profile CTA.
- All homepage background image uploads use `/uespak/home` and the requested usage labels.
- Site Settings already had profile PDF support; the uploader was refined to use `/uespak/profile` and `company-profile-pdf`.

## Public UI Changes

- Achievements now supports a full-width CMS background image with deep green overlay, technical grid pattern, and glass stat cards.
- Industries now supports a full-width CMS background image with overlay. When no image exists, it falls back to a clean white/mint design.
- CTA/Profile area now supports a full-width CMS background image from Contact CTA, falling back to Profile CTA image if needed.
- Profile CTA card can use its own uploaded card image while still sitting inside the full-width CTA band.
- Profile CTA button only renders as a working download link when Site Settings has a PDF URL. Otherwise a clean “Company profile will be available soon.” message is shown.

## Profile PDF Behavior

- Site Settings stores only metadata for the company profile PDF.
- The homepage uses `settings.profilePdfUrl` from public Site Settings.
- If a PDF exists, the Profile CTA download opens in a new tab.
- If no PDF exists, no dead download link is rendered.

## Responsive QA

- Full-width backgrounds are applied to outer sections, not inner boxes.
- Content remains inside the normal `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` container.
- Achievements uses desktop text + stat grid and stacks on smaller screens.
- Industries uses 4 columns desktop, 2 columns tablet, 1 column mobile.
- CTA cards align in 2 columns desktop and stack on mobile with balanced heights.
- Buttons and cards avoid horizontal overflow.

## Manual Tests

- Opened `/` and checked the updated sections render with fallback gradients when no uploaded image exists.
- Confirmed Profile/Contact CTA no longer has a large blank card space and both CTA cards align visually.
- Confirmed the Site Settings Profile PDF field exists and now uses the requested upload folder/usage.
- Confirmed `/admin/home` exposes upload controls for Achievements, Industries, Contact CTA, and Profile CTA images.
- Confirmed build output still includes `/`, `/services`, `/projects`, `/careers`, `/admin/home`, `/admin/settings`, and `/admin/team`.

## Lint / Build Status

- `npm run lint`: passed.
- `npm run build`: passed.
- Build still logs existing MongoDB DNS `ECONNREFUSED` warnings during static generation, but exits successfully.

## Notes

- Live upload/save/refresh testing requires authenticated admin access and reachable MongoDB/ImageKit services.
- No binary files are stored in MongoDB; only media metadata is saved.
