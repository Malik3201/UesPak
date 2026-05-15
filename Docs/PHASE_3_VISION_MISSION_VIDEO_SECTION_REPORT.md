# Phase 3 Vision / Mission Video Section Report

## Summary

The homepage Vision / Mission / Values section was upgraded into a premium "Our Purpose" section with three pillar cards (Vision, Mission, Values) on the left and a CMS-managed video preview card with modal player on the right. Admin can now upload a short overview video and a poster image directly from `/admin/home`.

## Files Created

- `src/components/public/home/VisionMissionSection.tsx`
- `PHASE_3_VISION_MISSION_VIDEO_SECTION_REPORT.md`

## Files Updated

- `src/types/home-page.ts` — added `video`, `videoPoster`, `videoTitle`, `videoDescription` to `visionMission`.
- `src/models/HomePage.ts` — added the same fields to the `IHomePage` interface and the Mongoose `visionMission` sub-schema (using the existing reusable `mediaSchema`, no binary storage).
- `src/validators/home-page.validator.ts` — added matching Zod fields under `visionMission`. Existing `mediaObjectSchema` already requires only `url`, so video media (which may not have width/height) passes validation cleanly.
- `src/constants/home-page.ts` — refreshed `visionMission` defaults: new eyebrow ("Our Purpose"), new title ("Guided by Vision, Driven by Mission"), and added defaults for `videoTitle` / `videoDescription`.
- `src/components/admin/home/HomePageForm.tsx` — added Overview Video uploader, Video Poster uploader, Video title and Video description inputs. Renamed the existing image to "Fallback Image" with helper text. Routed all uploads through `MEDIA_UPLOAD_FOLDERS.home` with `usage` tags `home-vision-video`, `home-vision-video-poster`, and `home-vision-mission`.
- `src/components/admin/media/AdminMediaUploader.tsx` — added `mediaType: "video"` support: video MIME accept defaults, 50MB default size limit, and a `<video controls>` preview after upload. Image / PDF / "any" modes still work.
- `src/validators/media.validator.ts` — added `ALLOWED_VIDEO_MIME_TYPES` (`video/mp4`, `video/webm`, `video/quicktime`), `VIDEO_MAX_SIZE_BYTES = 50MB`, and extended `validateFileSize` and `resolveMediaType` to handle videos.
- `src/models/MediaAsset.ts` — extended the `type` enum to include `"video"`.
- `src/lib/imagekit.ts` — extended `ImageKitUploadResultNormalized.type` union with `"video"`.
- `src/app/api/admin/upload/route.ts` — error message updated to mention the newly accepted video formats.
- `src/constants/media-folders.ts` — added `home: "/uespak/home"` so admin uploads from the home form land in the correct folder (this also fixes existing home-related uploads that were previously falling back to `/uespak/general`).
- `src/app/(public)/page.tsx` — replaced the inline three-column Vision / Mission / Values block with the new `<VisionMissionSection section={home.visionMission} />` component.
- `src/app/globals.css` — added scoped `vision-mission-*` and `vision-play-pulse` / `vision-modal-fade` utilities + keyframes. All animations honor `prefers-reduced-motion`.

## Admin / CMS Changes

`/admin/home` Vision / Mission / Values panel now includes:

- Overview Video uploader (`mediaType: "video"`, max 50MB, accepts MP4 / WebM / MOV).
- Video Poster Image uploader.
- Video title and Video description text inputs.
- Existing Section image is preserved and clearly labeled as the Fallback Image.

The PATCH `/api/admin/home` endpoint already merges the raw incoming body into the defaults + existing document and validates the fully merged document against the full `homePageSchema`, so the new `visionMission.video`, `videoPoster`, `videoTitle`, and `videoDescription` fields persist on save and load correctly on refresh without any further API changes.

GET / PATCH response shape is unchanged:

```
{ success: true, data: { homePage, persisted } }
```

## Upload Changes

- The admin upload route now accepts `video/mp4`, `video/webm`, and `video/quicktime` in addition to images and PDF.
- `validateFileSize` enforces a 50MB cap for video uploads.
- `resolveMediaType` returns `"video"` for accepted video MIME types and any other `video/*` MIME safely.
- Videos are persisted to `MediaAsset` with `type: "video"` and `resourceType: "raw"` (no binary stored in MongoDB; the file lives on ImageKit).
- ImageKit credentials are not exposed; uploads continue to use the existing private-key Basic auth flow on the server.

## Public UI Changes

The new `VisionMissionSection` is a self-contained, premium white card with:

- Centered eyebrow ("Our Purpose"), strong headline, and subtle dual accent lines.
- Decorative dot grid + radial green wash for premium engineering feel.
- **Left column**: three premium pillar cards (Vision / Mission / Values) with green icon tiles, hover lift, soft shadow, ring color shift, and staggered fade-up animation.
- **Right column**: large rounded video preview card with green corner accents, a layered green overlay, a circular play button with a soft green pulse, label ("Watch UESPAK Overview"), and a hover scale on the card.
- Optional caption text under the video card sourced from `videoDescription`.

Fallback behavior:
- If `visionMission.video` is set → play button + modal.
- Else if `visionMission.videoPoster` or `visionMission.image` is set → static visual, no play button.
- Else → premium green gradient with sparkle icon as the visual.

## Video Modal Behavior

- Click on the video card or play button opens the modal (only when a video URL exists).
- Modal: dark backdrop with blur, centered video frame, close button top-right, plays the video with native HTML5 `<video controls autoPlay playsInline>`.
- Closing options: explicit close button, click outside the video, or the `Escape` key.
- On close: video is paused and `currentTime` reset to 0.
- Body scroll is locked while the modal is open and restored on close.
- Focus is moved to the close button on open.
- ARIA: `role="dialog"`, `aria-modal="true"`, dialog is labeled by the video title; play button has accessible label `Play UESPAK overview video`; close button has accessible label `Close video`.
- No autoplay on initial page load.

## Manual Tests

Admin:
1. Open `/admin/home`, navigate to Vision / Mission / Values.
2. Edit eyebrow, title, vision/mission/values text.
3. Upload an MP4 in Overview Video. Confirm the video preview is shown inline.
4. Upload a PNG/JPG in Video Poster Image. Confirm the poster preview is shown.
5. Set Video title and Video description.
6. Save → success message appears.
7. Refresh `/admin/home` → all fields (text, video, poster, captions) remain.

Public:
1. Open `/` → confirm Vision / Mission / Values section now uses the new premium layout.
2. Three pillar cards show with hover lift and icon scale animation.
3. Video preview card shows poster (or fallback gradient) with overlay and pulsing play button.
4. Click the play button or card → modal opens, video plays.
5. Close via X, click outside, or `Escape` → video stops and modal closes.
6. Resize to mobile → cards stack, video card stays readable, no horizontal overflow.
7. Confirm Hero, Our Story, Featured Services, Services Overview, Featured Projects, Industries, etc. continue to render unchanged.

## Lint / Build Status

- `npm run lint` — no errors introduced.
- The pre-existing CSS warning about Tailwind v4's `@theme` at-rule remains unchanged.
- `npm run build` — pending final local verification (Mongo Atlas may be unreachable from this environment during static generation; build itself succeeded previously with the same conditions).

## Next Recommended Section

Polish the homepage **Why Choose UESPAK** section next. It currently uses a basic three-column card list; a similar premium card + accent treatment will continue the upgraded look established by the Capabilities and Vision/Mission sections.
