# Phase 4 — CMS-Managed Public Pages & Contact Enquiries

## Summary

Milestone 4 adds CMS-managed public pages for:

- About Us (`/about-us`)
- Careers (`/careers`)
- Contact Us (`/contact-us`)

It also extends the contact enquiry system with richer submission fields and an admin enquiry management screen.

## CMS model and fields

### New model

- `src/models/PageContent.ts`

The model stores reusable public-page content by `pageKey`:

- `about`
- `careers`
- `contact`

Core fields:

- `pageKey`
- `title`
- `slug`
- `isActive`
- `hero`
  - `eyebrow`
  - `title`
  - `description`
  - `backgroundImage`
  - `primaryButtonText`
  - `primaryButtonUrl`
  - `secondaryButtonText`
  - `secondaryButtonUrl`
- `sections`
  - Page-specific structured content
- `seo`
  - `metaTitle`
  - `metaDescription`
  - `keywords`
  - `canonicalUrl`
  - `ogTitle`
  - `ogDescription`
  - `ogImage`
  - `robots.index`
  - `robots.follow`
  - `schemaType`
- `createdBy`
- `updatedBy`
- timestamps

Media objects follow the existing ImageKit media shape and only require `url`.

## Types, defaults and validation

Created:

- `src/types/page-content.ts`
- `src/constants/page-content.ts`
- `src/validators/page-content.validator.ts`
- `src/lib/page-content.ts`

The helper layer provides:

- `getPageContent(pageKey)`
- `getAboutPageContent()`
- `getCareersPageContent()`
- `getContactPageContent()`
- `getPageSeoMetadata(pageContent)`
- `getDefaultAboutPage()`
- `getDefaultCareersPage()`
- `getDefaultContactPage()`

Public helpers return safe fallback defaults if the database is unavailable, so static generation does not crash.

## Admin routes added

- `/admin/pages/about`
- `/admin/pages/careers`
- `/admin/pages/contact`
- `/admin/enquiries`

Admin sidebar now links to:

- About Page
- Careers Page
- Contact Page
- Enquiries

## API endpoints added

### Page CMS

- `GET /api/admin/pages/[pageKey]`
- `PATCH /api/admin/pages/[pageKey]`

Allowed page keys:

- `about`
- `careers`
- `contact`

The PATCH route:

- requires admin authentication
- validates the page key
- merges defaults + existing document + incoming body
- preserves nested media fields explicitly
- validates with Zod
- upserts by `pageKey`
- sets `updatedBy`
- sets `createdBy` on insert
- revalidates the relevant public route

### Enquiries

- `GET /api/admin/enquiries`
- `GET /api/admin/enquiries/[id]`
- `PATCH /api/admin/enquiries/[id]`
- `DELETE /api/admin/enquiries/[id]`

## About page

Updated:

- `src/app/(public)/about-us/page.tsx`

Includes:

- CMS hero with background image and deep green overlay
- Company overview section
- Our Story section
- Vision / Mission / Values cards
- Capabilities cards
- Why Choose UESPAK cards
- CTA band
- CMS SEO metadata
- AboutPage JSON-LD

## Careers page

Updated:

- `src/app/(public)/careers/page.tsx`
- `src/components/public/careers/CareersTeamSection.tsx`

Includes:

- CMS hero with background image and overlay
- Careers intro section
- Why Work With UESPAK cards
- Culture / Values cards
- Team section using existing Team Members CMS and TeamMemberCard
- Apply CTA
- CMS SEO metadata
- WebPage JSON-LD

## Contact page

Updated:

- `src/app/(public)/contact-us/page.tsx`

Includes:

- CMS hero with background image and overlay
- Contact info cards with Site Settings fallbacks
- Working contact form
- Large embedded map using Site Settings `mapEmbedUrl` by default
- Support cards
- CMS SEO metadata
- ContactPage JSON-LD

## Enquiry system

Updated:

- `src/models/ContactSubmission.ts`
- `src/validators/contact.validator.ts`
- `src/app/api/contact/route.ts`

Added fields:

- `company`
- `serviceInterest`
- `consent`
- `source`

Admin management:

- List enquiries
- Search
- Filter by status
- Pagination
- View full message
- Mark read
- Mark replied
- Archive
- Reply via `mailto:`

## Media upload and persistence

Added upload folder:

- `MEDIA_UPLOAD_FOLDERS.pages = "/uespak/pages"`

Admin form media fields:

- Hero background image
- About overview image
- About story image
- About CTA background image
- Careers intro image
- Careers CTA background image
- SEO OG image

The admin API explicitly preserves nested media fields on PATCH to prevent saved uploads from disappearing after save/refresh.

## SEO behavior

Each CMS page supports:

- meta title
- meta description
- keywords
- canonical URL
- Open Graph title/description/image
- robots index/follow
- schema type

Fallback metadata is provided per page:

- About: `About UESPAK | Engineering, Automation & Agriculture Solutions`
- Careers: `Careers at UESPAK | Join Our Engineering Team`
- Contact: `Contact UESPAK | Engineering & Technical Services`

## Manual tests

Performed:

- Opened `/about-us`; verified premium public layout renders from fallback CMS defaults.
- Opened `/careers`; verified premium layout and existing Team Members integration render.
- Opened `/contact-us`; verified contact cards, form fields, map section and support cards render.
- Confirmed footer still appears after all pages.
- Confirmed `npm run lint` passes.
- Confirmed `npm run build` passes.

Notes:

- Build logs still show pre-existing MongoDB Atlas DNS `ECONNREFUSED` warnings during static generation, but the build completes successfully and public helpers fall back safely.

## Next recommended work

- Add a dedicated Jobs/Openings CMS for careers.
- Add admin email notifications / SMTP settings if required.
- Add export/download for enquiries.
- Add richer per-page media galleries if needed.
