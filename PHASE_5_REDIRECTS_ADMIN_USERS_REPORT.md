# Phase 5 — Redirects & Admin Users Report

## Redirects Functionality

Admin can create, edit, activate/deactivate, and delete URL redirects. Published active redirects apply on the public site before normal routing.

### Model / API / Admin UI

| Item | Path |
|------|------|
| Model | `src/models/Redirect.ts` |
| Types | `src/types/redirect.ts` |
| Validator | `src/validators/redirect.validator.ts` |
| Lib | `src/lib/redirects.ts`, `src/lib/redirect-path.ts` (Edge-safe) |
| Admin API | `GET/POST /api/admin/redirects`, `GET/PATCH/DELETE /api/admin/redirects/[id]` |
| Public lookup | `GET /api/redirects/lookup?path=...` |
| Admin pages | `/admin/redirects`, `/admin/redirects/new`, `/admin/redirects/[id]` |
| Components | `RedirectStatusBadge`, `RedirectsTable`, `RedirectsPageClient`, `RedirectForm` |

**Validation:** `fromPath` required, starts with `/`, no domain; `toPath` internal or `http(s)`; unique `fromPath`; no self-redirect; loop detection on save; status codes 301/302/307/308.

**Delete:** Hard delete (appropriate for redirect records).

### Redirect Runtime Behavior

Because `src/proxy.ts` is **Edge-only** and cannot use Mongoose:

1. **Auth logic unchanged** — admin routes still require JWT first.
2. **Public redirect lookup** — proxy calls Node API `GET /api/redirects/lookup` (uses in-memory cache + MongoDB).
3. **Skipped paths:** `/admin`, `/api`, `/_next`, static files (extension), `favicon.ico`, `robots.txt`, `sitemap.xml`.
4. **Hit tracking:** `hitCount` and `lastHitAt` updated on lookup (non-blocking).
5. **Matcher expanded** for public HTML routes; admin matcher unchanged.

External `toPath` values redirect to full URLs; internal paths use same-origin resolution.

### Edge / Proxy Notes

- Mongoose is **not** imported in `src/proxy.ts` — only `src/lib/redirect-path.ts`.
- Redirect map cached 30s in Node; cleared on admin CRUD.
- Every public page request triggers one internal lookup fetch (acceptable trade-off for dynamic DB redirects).

---

## Admin Users Functionality

Extends existing `AdminUser` model and login flow — no duplicate user model.

### Model / API / Admin UI

| Item | Path |
|------|------|
| Model | `src/models/AdminUser.ts` (extended: `viewer` role, `createdBy`, `updatedBy`) |
| Types | `src/types/admin-user.ts`, `src/types/admin.ts` |
| Validator | `src/validators/admin-user.validator.ts` |
| Lib | `src/lib/admin-users.ts` |
| Admin API | `GET/POST /api/admin/users`, `GET/PATCH/DELETE /api/admin/users/[id]` |
| Admin pages | `/admin/users`, `/admin/users/new`, `/admin/users/[id]` |
| Components | `AdminUserStatusBadge`, `AdminUsersTable`, `AdminUsersPageClient`, `AdminUserForm` |

**Passwords:** bcrypt via existing `src/lib/password.ts`; `passwordHash` never returned in API responses.

**DELETE:** Sets `status: inactive` (soft disable), not hard delete.

### Roles / Status Behavior

| Role | Intended access |
|------|-----------------|
| `superAdmin` | Full access; **only role** that can manage admin users |
| `admin` | CMS access (unchanged for other modules) |
| `editor` | Content create/edit |
| `viewer` | Read-only (field stored; full read-only UI not enforced on all modules yet) |

| Status | Login |
|--------|-------|
| `active` | Allowed |
| `inactive` / `suspended` | Blocked (generic error message) |

**Enforcement today:** `requireSuperAdmin()` on `/api/admin/users/*`. Other CMS APIs still use `requireAdmin()` only.

### Security Protections

- Cannot disable your own account.
- Cannot disable or demote the **last active** `superAdmin`.
- Email uniqueness enforced.
- Password min 8 chars on create; optional on update with confirm match.
- `lastLogin` updated on successful login (existing behavior).

---

## Sidebar Updates

- **Redirects** → `/admin/redirects` (active link)
- **Admin Users** → `/admin/users` (active link)

---

## Manual Tests

| Area | Automated | Browser QA |
|------|-----------|------------|
| Redirects CRUD | Build/lint pass | Create `/old-test` → `/services`, visit URL, toggle active, delete |
| Admin users CRUD | Build/lint pass | Super admin creates user, disables, login blocked |
| Auth regression | Routes compile | `/admin/login`, existing CMS pages |
| Proxy | No Mongoose in proxy bundle | Confirm `/admin` and `/api` unaffected |

---

## Lint / Build Status

- `npm run lint` — pass (0 errors)
- `npm run build` — pass (55 pages; MongoDB unavailable at build time — graceful fallbacks)

---

## Next Recommended Step

1. Enforce `viewer` read-only and `admin` vs `editor` permissions on destructive CMS actions.
2. Optional: reduce redirect lookup latency (edge KV or build-time sync).
3. Activity audit log for admin user changes.
