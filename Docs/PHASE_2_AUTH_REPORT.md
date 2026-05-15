# Phase 2 — Admin Authentication (Report)

This phase delivers a production-oriented admin authentication baseline: seeded super-admin, httpOnly JWT cookie (no tokens in JSON or browser storage), protected admin UI and `/api/admin/*`, and typed helpers for future CMS modules.

## What was implemented

- **JWT (jose)**: Signs and verifies admin JWTs on the Edge via `src/proxy.ts`; HS256 payload includes `userId`, `email`, `name`, and `role`.
- **Cookies**: Session stored only in **`uespak_admin_token`** (`ADMIN_COOKIE_NAME` in `src/lib/constants.ts`): `HttpOnly`, `Secure` in production, `SameSite=Lax`, `Path=/`, `maxAge` aligned with `JWT_EXPIRES_IN` (default 7 days).
- **MongoDB `AdminUser`**: `passwordHash`, `role` (`superAdmin` | `admin` | `editor`), `status` (`active` | `inactive` | `suspended`), `lastLogin`, indexes on email (unique), role, and status.
- **API**: `POST /api/auth/login` (Zod-validated JSON, bcrypt check, generic errors, optional in-memory rate limit), `POST /api/auth/logout`, `GET /api/admin/dashboard` (authenticated, safe stats placeholders).
- **UI**: Login page wired with React Hook Form + Zod; dashboard shows signed-in admin and placeholder stat cards; admin shell only under `(authenticated)`; sidebar lists future CMS nav (only Dashboard linked).
- **Proxy (Next.js 16)**: `src/proxy.ts` is the canonical edge entry (this project must **not** also ship `src/middleware.ts` — Next detects both and asks for **proxy-only**). Public: `/admin/login`, `/api/auth/login`, `/api/auth/logout`. Protected admin pages redirect to login; `/api/admin/*` returns JSON 401 when unauthenticated.

## Files created

- `scripts/seed-admin.ts` — Bootstrap first super-admin from env vars.
- `PHASE_2_AUTH_REPORT.md` — This document.
- `src/types/admin.ts` — `AdminRole`, `AdminStatus`, `SafeAdmin`.
- `src/lib/login-rate-limit.ts` — Simple per–IP/email login throttling for `POST /api/auth/login`.
- `src/components/admin/AdminLoginForm.tsx` — Client login form.
- `src/proxy.ts` — Edge-safe admin routing guard (Next.js 16 proxy entry).

## Files updated (high level)

- `src/lib/jwt.ts` — Replaced legacy `jsonwebtoken` usage with **`signAdminToken`** / **`verifyAdminToken`** (jose) and **`jwtExpiresInSeconds`**.
- `src/lib/auth.ts` — **`getCurrentAdmin`**, **`requireAdmin`**, **`hasRole`**, **`requireRole`**, **`AdminAuthError`**, **`AdminForbiddenError`**.
- `src/lib/password.ts` — **`hashPassword`**, **`comparePassword`** (bcrypt salt rounds 12).
- `src/lib/constants.ts` — `ROLES` values aligned with `superAdmin`; single cookie name documentation.
- `src/lib/api-response.ts` — **`tooManyRequestsResponse`** (429).
- `src/models/AdminUser.ts` — New fields/enums/indexes per spec (breaking vs old `password` / `isActive` / `super_admin` — see migrations below).
- `src/app/api/auth/login/route.ts`, `logout/route.ts`, `api/admin/dashboard/route.ts`.
- `src/app/admin/login/page.tsx`, `(authenticated)/dashboard/page.tsx`.
- `src/components/admin/AdminSidebar.tsx`, `AdminHeader.tsx`.
- `package.json` — `seed:admin`, dev deps `tsx` + `dotenv`; removed **`jsonwebtoken`**.
- `.env.example` — Placeholder values plus **`SEED_ADMIN_*`** vars (previous example file contained invalid/secret-like values — use real secrets only in `.env.local`).
- **`src/app/(public)/page.tsx`**, **`src/lib/db.ts`**, **`src/types/global.ts`** — Minor lint fixes (`Link` usage, stale `eslint-disable` directives).

**Removed**: `src/middleware.ts` (Next.js 16 **proxy-only** requirement).

## Auth cookie name

- **`uespak_admin_token`** — constant **`ADMIN_COOKIE_NAME`** in `src/lib/constants.ts` (same string used everywhere).

## Protected vs public routes

| Area | Behaviour |
|------|-----------|
| `/admin/login` | Public (no sidebar). |
| `/admin/*` (except login) | Requires valid cookie + JWT; missing/invalid → redirect to `/admin/login`. |
| `/api/auth/login`, `/api/auth/logout` | Public; outside the proxy `matcher`. |
| `/api/admin/*` | Requires cookie + JWT; otherwise **401 JSON**. |
| Public site, static assets | Unchanged — proxy `matcher` excludes them. |

## Required environment variables

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | HMAC secret (min 32 chars validated in `src/lib/env.ts`) |
| `JWT_EXPIRES_IN` | Optional; default `7d` (JWT + cookie alignment) |

For **`npm run seed:admin`** (one-time bootstrap):

| Variable | Purpose |
|----------|---------|
| `SEED_ADMIN_NAME` | Display name |
| `SEED_ADMIN_EMAIL` | Lowercased/stored unique email |
| `SEED_ADMIN_PASSWORD` | Plain password (never logged); min length 8 in script |

All other vars in `.env.example` remain required for unrelated app features (`env.ts`).

## Migrating existing `AdminUser` documents

Older documents used **`password`**, **`isActive`**, **`super_admin`**, **`lastLoginAt`**. Current schema expects **`passwordHash`**, **`status`**, **`superAdmin`** role spelling, **`lastLogin`**. Existing rows will not validate until migrated or recreated; recommended path for dev: **`npm run seed:admin`** on a fresh DB or manual migration script for production data.

## How to create the first admin

1. Copy env template: **`cp .env.example .env.local`** (adjust for your shell on Windows).
2. Set **`MONGODB_URI`**, **`JWT_SECRET`** (≥32 chars), **`JWT_EXPIRES_IN`** if desired.
3. Set **`SEED_ADMIN_NAME`**, **`SEED_ADMIN_EMAIL`**, **`SEED_ADMIN_PASSWORD`** (≥8 chars).
4. **`npm install`**
5. **`npm run seed:admin`** — skips safely if email already exists.
6. **`npm run dev`** and open **`/admin/login`**.

Do not commit **`.env.local`** or paste real passwords into reports or logs.

## How to test login and logout

1. Open **`http://localhost:3000/admin/login`** (adjust host/port as needed).
2. Sign in with the seeded credentials.
3. Expect redirect to **`/admin/dashboard`**; session cookie appears in Application → Cookies (httpOnly — not readable from JS).
4. Use header **Logout** or **`POST /api/auth/logout`**; cookie cleared; **`/admin/dashboard`** should redirect to login when navigated cold.

Verify **`GET /api/admin/dashboard`** with and without cookie (curl or browser DevTools):

- With session: **`200`** and `currentUser` + placeholder stats.
- Without: **`401`**.

## Assumptions and notes

- **Rate limiting**: In-memory Map only (fine for single Node instance; resets on redeploy — see `src/lib/login-rate-limit.ts`).
- **jwt `sub` fallback**: Verification accepts legacy-shaped tokens that only set `sub` as the user id; new tokens sets explicit **`userId`**.
- **`jsonwebtoken` removed**: All minting uses jose (`signAdminToken`).
- **`src/proxy.ts`**: Canonical place to adjust admin/API matching rules alongside `matcher` exports.

- **`src/middleware.ts` removed**: Next.js **16.2.4** build fails when both `middleware.ts` and `proxy.ts` exist; this repo relies on **`src/proxy.ts` only**.

---

## Commands (quick reference)

```bash
cp .env.example .env.local
npm install
npm run seed:admin
npm run dev
```

Lint and build verification:

```bash
npm run lint
npm run build
```
