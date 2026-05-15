# Phase 2 — Media Upload Foundation Report

## What Was Implemented

A secure, production-ready media upload system for the UESPAK admin panel backed by Cloudinary and MongoDB. Admins can now upload images (JPG, PNG, WebP, SVG) and PDFs through the admin UI or directly via API. Uploaded assets are stored in Cloudinary (no binary files in MongoDB) and their metadata is persisted in the `MediaAsset` MongoDB collection.

---

## Files Created

| File | Purpose |
|------|---------|
| `src/app/api/admin/upload/route.ts` | POST — protected Cloudinary upload endpoint |
| `src/app/api/admin/media/route.ts` | GET — paginated media asset listing endpoint |
| `src/app/api/admin/media/[id]/route.ts` | DELETE — soft-archive asset (removes from Cloudinary) |
| `src/components/admin/media/AdminMediaUploader.tsx` | Reusable client upload component |
| `src/app/admin/(authenticated)/media/page.tsx` | Admin Media Library page |

---

## Files Updated

| File | Changes |
|------|---------|
| `src/lib/cloudinary.ts` | Added `settings`, `seo`, `clients` folder constants; exported `CloudinaryFolder` type |
| `src/models/MediaAsset.ts` | Added `type`, `filename`, `originalFilename`, `mimeType`, `usage`, `status` fields; added DB indexes |
| `src/validators/media.validator.ts` | Added MIME type lists, size constants, `validateMimeType`, `validateFileSize`, `resolveMediaType` helpers |
| `src/components/admin/settings/SiteSettingsForm.tsx` | Integrated `AdminMediaUploader` for Logo, Dark Logo, Favicon, Profile PDF, OG Image |
| `src/components/admin/AdminSidebar.tsx` | Media Library nav item changed from placeholder to live link `/admin/media` |

---

## API Endpoints

### POST `/api/admin/upload`
Upload a file to Cloudinary and persist metadata in MongoDB.

- **Auth**: Admin JWT cookie required (returns 401 otherwise)
- **Content-Type**: `multipart/form-data`
- **Form fields**:
  - `file` (required) — the file to upload
  - `folder` (optional) — target Cloudinary folder (defaults to `uespak/general`)
  - `altText` (optional) — alt text for images
  - `usage` (optional) — tag for usage context (e.g. `logo`, `ogImage`)
- **Response**:
```json
{
  "success": true,
  "message": "File uploaded successfully.",
  "data": {
    "asset": {
      "id", "url", "secureUrl", "publicId", "type",
      "filename", "originalFilename", "altText", "folder",
      "format", "size", "width", "height", "mimeType", "usage"
    }
  }
}
```

### GET `/api/admin/media`
List active media assets with pagination.

- **Auth**: Admin JWT cookie required
- **Query params**: `type`, `folder`, `status`, `page`, `limit` (default 20)
- **Returns**: `{ assets: [...], pagination: { page, limit, total, totalPages } }`

### DELETE `/api/admin/media/[id]`
Soft-archive a media asset (removes from Cloudinary, marks DB record `archived`).

- **Auth**: Admin JWT cookie required
- **Returns**: `{ id, status: "archived" }`

---

## Supported File Types

| Type | MIME | Max Size |
|------|------|----------|
| JPEG | `image/jpeg`, `image/jpg` | 5 MB |
| PNG | `image/png` | 5 MB |
| WebP | `image/webp` | 5 MB |
| SVG | `image/svg+xml` | 5 MB |
| PDF | `application/pdf` | 20 MB |

---

## Cloudinary Folders

| Constant | Folder Path | Usage |
|----------|------------|-------|
| `CLOUDINARY_FOLDERS.general` | `uespak/general` | Default fallback |
| `CLOUDINARY_FOLDERS.settings` | `uespak/settings` | Logo, dark logo, favicon |
| `CLOUDINARY_FOLDERS.profilePdf` | `uespak/profile-pdf` | Company profile PDF |
| `CLOUDINARY_FOLDERS.services` | `uespak/services` | Service images |
| `CLOUDINARY_FOLDERS.projects` | `uespak/projects` | Project galleries |
| `CLOUDINARY_FOLDERS.team` | `uespak/team` | Team photos |
| `CLOUDINARY_FOLDERS.seo` | `uespak/seo` | OG images |
| `CLOUDINARY_FOLDERS.clients` | `uespak/clients` | Client logos |

---

## How to Test Upload

### Test A — Unauthenticated upload (expect 401)
```bash
curl -X POST http://localhost:3000/api/admin/upload \
  -F "file=@/path/to/image.jpg"
# Expected: { "success": false, "message": "Unauthorized..." }
```

### Test B — Authenticated upload
1. Log in at `/admin/login`
2. Go to `/admin/settings`
3. In the **Brand** section, click **Choose file** under "Upload logo image"
4. Select a PNG/JPG/WebP/SVG file ≤5MB
5. Click **Upload**
6. The logo URL input auto-fills with the Cloudinary URL
7. Click **Save settings**
8. Refresh the page — logo persists

### Test C — Upload Profile PDF
1. In Site Settings → Profile PDF section
2. Click **Choose file** under "Upload company profile PDF"
3. Select a PDF ≤20MB, click **Upload**
4. The profilePdf URL input auto-fills
5. Save settings → refresh → PDF URL persists

### Test D — Invalid file type (expect error)
1. Try to upload an `.exe` or `.docx` file
2. Expected: client-side file picker filter rejects it; if bypassed, server returns 400

### Test E — Oversized file (expect error)
1. Try to upload an image >5MB
2. Expected: "File is too large" validation error in the uploader component

---

## How Site Settings Uses the Uploader

Each media field in Site Settings now has two input methods:

1. **Manual URL** — existing text input (unchanged, still works)
2. **Upload** — `AdminMediaUploader` component below each URL input

When a file is uploaded successfully:
- `setValue(fieldName, mediaObject)` is called via react-hook-form
- The URL input auto-fills with the Cloudinary HTTPS URL
- Width, height, format, size, publicId are stored in the media object
- After clicking **Save settings**, the full media object is persisted in MongoDB

Fields with uploaders:
- Logo → folder: `uespak/settings`
- Dark Logo → folder: `uespak/settings`
- Favicon → folder: `uespak/settings`
- Profile PDF → folder: `uespak/profile-pdf`
- OG Image → folder: `uespak/seo`

---

## Media Library

Located at `/admin/media`. Shows all active uploaded assets as a grid with:
- Image thumbnails (lazy-loaded)
- PDF icon + open link
- Filename, type, file size
- Filter by type (All / Images / PDFs)
- Pagination (24 per page)

---

## Environment Variables Required

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

If these are missing, the upload endpoint returns HTTP 500 with a descriptive error message (no secret is leaked).

---

## Notes for Next Step: Services CMS

- **Service images** should use `folder: CLOUDINARY_FOLDERS.services` (`uespak/services`)
- Import `AdminMediaUploader` from `@/components/admin/media/AdminMediaUploader`
- Import `CLOUDINARY_FOLDERS` from `@/lib/cloudinary`
- The `MediaAsset` model stores the `usage` field — set it to `"serviceImage"` or similar
- The media listing API supports `?type=image&folder=uespak/services` for filtered views
- The `deleteFromCloudinary` helper in `@/lib/cloudinary` can be called when a service is deleted
