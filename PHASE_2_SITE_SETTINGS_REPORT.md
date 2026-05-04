# Milestone 2 — Site Settings CMS (Report)

## Summary

Delivered a **singleton Site Settings** module: MongoDB `SiteSetting` document keyed by `site-settings`, Zod-validated admin API (`GET` / `PATCH`), full **admin form** at `/admin/settings`, public helpers for layout components, and **root metadata** merged from CMS SEO defaults when available.

## Files created

- `src/constants/site-settings.ts` — document key constant.
- `src/constants/default-site-settings.ts` — client-safe defaults + `siteSettingsDtoToForm` for media rows.
- `src/types/site-settings.ts` — DTO + `PublicSiteSettings` types.
- `src/lib/site-settings.ts` — `getSiteSettings`, `getDefaultSiteSettings`, `getPublicSiteSettings`, legacy field migration shims (phones/emails/social/SEO bucket).
- `src/app/api/admin/settings/route.ts` — protected admin REST handler.
- `src/app/admin/(authenticated)/settings/page.tsx` — admin page shell + metadata.
- `src/components/admin/settings/SiteSettingsForm.tsx` — client CMS form with dynamic arrays & keyword CSV.
- `PHASE_2_SITE_SETTINGS_REPORT.md` — this document.

## Files updated

- `src/models/SiteSetting.ts` — full schema (brand, contact arrays, social, profile PDF CTA footer, SEO, global CTA, legacy mirrors, `createdBy` / `updatedBy`, singleton key + `siteSettingToDTO`).
- `src/validators/settings.validator.ts` — `siteSettingsSchema` / `siteSettingsUpdateSchema` + `SiteSettingsInput`.
- `src/components/admin/AdminSidebar.tsx` — working **Site Settings** link + improved active matching.
- `src/app/(public)/layout.tsx` — single `getPublicSiteSettings()` fetch passed to **Header** + **Footer**.
- `src/components/public/Header.tsx`, `TopBar.tsx`, `Navbar.tsx`, `Footer.tsx` — consume `PublicSiteSettings` with safe fallbacks.
- `src/lib/seo.ts` — `mergeRootSiteMetadata()` for root `generateMetadata`.
- `src/app/layout.tsx` — async `generateMetadata()` using CMS SEO defaults.
- `src/lib/site-settings.ts` — shared defaults via `cloneDefaultSiteSettings`.

## API

| Method | Path | Auth | Description |
|--------|------|------|--------------|
| `GET` | `/api/admin/settings` | Admin JWT + active user | Loads singleton merged with legacy migrations; responds with `{ settings, persisted, publicPreview }`. |
| `PATCH` | `/api/admin/settings` | Admin JWT + active user | Full validated upsert keyed to `site-settings`; sets `updatedBy`; seeds `createdBy` on insert. |

## Admin URL

- **https://\<host\>/admin/settings** (`/admin/settings` locally)

Requires login; unauthorized API calls return `{ success:false, … }` with HTTP **401**.

## Supported fields

- Brand: `siteName`, `tagline`, `logo` / `darkLogo` / `favicon` (**URL + meta only** via form).
- Contact: labelled `phones[]`, `emails[]`, free-text address, working hours, `mapEmbedUrl`.
- Social: `socialLinks[]` with platform, URL, optional icon slug, active flag, deterministic order.
- Profile download: PDF URL & button caption.
- Footer: headline + body + copyright overrides.
- Global CTA: optional replacement for navbar contact CTA incl. URLs.
- SEO defaults: title, description, keyword list (comma-separated in UI → array in API), canonical, OG title/description/image, robots booleans, optional schema type helper.
- Ops: timestamps, `createdBy`, `updatedBy` ObjectIds (non-sensitive identifiers only).

### Media posture

URLs + optional `altText`; `publicId` defaults server-side when absent (`"external"`). **No uploads** wired in UI — next milestone can reuse existing Cloudinary/API routes.

### Legacy migrations

Older documents with `global` key, flat `phone`/`email`, per-network strings, or `defaultSeo` are merged logically on read paths before the admin/UI sees them — first successful PATCH persists the new canonical shape keyed as `site-settings`.

## Testing locally

```bash
cp .env.example .env.local  # configure MONGODB_URI + JWT + seed admin vars
npm run seed:admin
npm run dev
```

1. Log in at `/admin/login`.
2. Visit `/admin/settings` — loads remote JSON or seeded defaults banner.
3. Edit fields → **Save settings** (`PATCH`).
4. Hard refresh `/admin/settings` — values persist when Mongo reachable.
5. Visit public site `/` — header/footer reflect primary phone/email/footer/socials/profile link when URLs exist.
6. `curl http://localhost:3000/api/admin/settings` without cookie ⇒ **401** JSON response.

Lint / build gates:

```bash
npm run lint
npm run build
```

During `next build`, prerender invokes `generateMetadata()` which calls Mongo; unreachable clusters log **[UESPAK]** connection warnings yet fall back to static defaults (`mergeRootSiteMetadata` catch paths + `getSiteSettings` internals).

## Next steps

- Dedicated media picker + PDF upload bridging Cloudinary widgets.
- Per-page SEO overrides (Services/Projects phases).
- Map embed sanitization whitelist if raw iframe HTML desired.

## Operational notes

- Keep **JWT_SECRET**, **MONGODB_URI**, and admins seed vars in Vercel **Production**.
- Singleton enforced via **unique `{ key }`** constraint; PATCH always targets stable key **`site-settings`**.
