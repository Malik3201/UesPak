# Phase 2 ImageKit Migration Report

## What Was Changed

- Migrated admin media uploads from Cloudinary to ImageKit.
- Added a new server-only ImageKit helper and switched admin upload/delete routes to use it.
- Kept the upload response shape compatible for existing uploader UI (`publicId`, `url`, dimensions, etc.) while adding `fileId`.
- Kept MongoDB metadata persistence (`MediaAsset`) and did not store binaries in DB.
- Preserved existing admin UX in Site Settings uploader fields.

## Files Created

- `src/lib/imagekit.ts`
- `src/constants/media-folders.ts`
- `PHASE_2_IMAGEKIT_MIGRATION_REPORT.md`

## Files Updated

- `src/app/api/admin/upload/route.ts`
- `src/app/api/admin/media/route.ts`
- `src/app/api/admin/media/[id]/route.ts`
- `src/models/MediaAsset.ts`
- `src/components/admin/media/AdminMediaUploader.tsx`
- `src/components/admin/settings/SiteSettingsForm.tsx`
- `src/lib/env.ts`
- `src/lib/constants.ts`
- `src/types/media.ts`
- `.env.example`
- `package.json`
- `package-lock.json`

## Files Removed

- `src/lib/cloudinary.ts`
- `src/constants/cloudinary-folders.ts`

## Packages Installed/Removed

- Installed: `@imagekit/nodejs`
- Removed: `cloudinary`

## New Environment Variables

Required for upload functionality:

- `IMAGEKIT_PUBLIC_KEY`
- `IMAGEKIT_PRIVATE_KEY`
- `IMAGEKIT_URL_ENDPOINT`

Notes:

- `.env.example` now documents ImageKit variables.
- Runtime upload route validates these and returns a clear 500 error when missing.

## Upload Folders Used

All folders are normalized/validated in `src/lib/imagekit.ts`:

- `/uespak/settings`
- `/uespak/profile-pdf`
- `/uespak/services`
- `/uespak/projects`
- `/uespak/team`
- `/uespak/seo`
- `/uespak/clients`
- `/uespak/general`

## Response Normalization Decisions

ImageKit and Cloudinary naming differ, so uploads are normalized for UI/API compatibility:

- `publicId` maps to ImageKit `filePath` (fallback: `fileId`)
- `fileId` exposed explicitly for reliable delete operations
- `secureUrl` uses normalized ImageKit URL
- `type`, `format`, `size`, `width`, `height`, `mimeType` are preserved in API response

## Delete Behavior / Limitations

- Route: `DELETE /api/admin/media/[id]`
- If `fileId` exists, remote delete is attempted via ImageKit.
- If `fileId` is missing (legacy records), the record is still soft-archived in MongoDB and remote deletion is skipped with a warning.
- This keeps deletion safe and backwards-compatible during migration.

## Local Test Guide

1. Ensure ImageKit env vars are set.
2. Start app (`npm run dev`) and log into admin.
3. Go to `/admin/settings`.
4. Upload logo/favicon/PDF using existing uploader controls.
5. Save settings and refresh to confirm persistence.
6. Test invalid file type and oversize files for validation messages.

## Vercel Deployment Notes

- Add ImageKit env vars in Vercel project settings:
  - `IMAGEKIT_PUBLIC_KEY`
  - `IMAGEKIT_PRIVATE_KEY`
  - `IMAGEKIT_URL_ENDPOINT`
- Remove Cloudinary env vars from required runtime config.
- Since upload logic runs in route handlers with `runtime = "nodejs"`, this remains Vercel-serverless compatible.
