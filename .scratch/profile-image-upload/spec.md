# Profile Avatar and Banner Upload

Status: ready-for-agent

## Problem Statement

Tsuki users currently cannot upload or customize their profile avatar and banner images directly through the interface. Avatars are limited to third-party OAuth defaults or empty states, while banners only support entering raw external image URLs manually. There is no built-in mechanism to select a local image, preview and crop it to fit profile dimensions, and upload it securely. Users need an intuitive, responsive, and visually consistent way to personalize their Profile avatar and banner.

## Solution

Implement direct browser-to-ImageKit uploads for both Profile avatars and banners with client-side image cropping:

1. A unified client-side cropping dialog allows users to select an image, preview it locally, zoom, and reposition it to match the exact aspect ratio (1:1 for avatars, header aspect ratio for banners).
2. To keep the Elysia API lightweight and performant, image binaries do not pass through the backend server. Instead, the Elysia API provides an authenticated endpoint that generates temporary ImageKit upload authorization credentials (token, signature, and expiration timestamp) using the server-side ImageKit private key.
3. The browser uploads the cropped image Blob directly to ImageKit using the public key and signed parameters.
4. Upon receiving ImageKit's upload confirmation, the client requests a profile update on the Elysia API. The API verifies the authenticated user from the server-side Better Auth session and persists the new image URL / identifiers to the user's record.
5. Replaced ImageKit files are safely cleaned up after the database update succeeds.

## User Stories

1. As a signed-in user, I want to upload a custom avatar image from my device, so that my Profile reflects my personal identity.
2. As a signed-in user, I want to upload a custom banner image from my device, so that my Profile header has a personalized appearance.
3. As a signed-in user, I want to select standard image formats (JPEG, PNG, WebP), so that I can use common image files without manual conversion.
4. As a signed-in user, I want immediate validation feedback if I select an unsupported file type or an oversized file, so that I understand why a file cannot be uploaded.
5. As a signed-in user, I want to preview my selected image in a crop dialog before any upload occurs, so that I can decide whether to proceed without consuming network bandwidth or cloud storage.
6. As a signed-in user, I want to pan and zoom the image within a fixed 1:1 square crop area for avatars, so that my avatar is framed exactly as I want.
7. As a signed-in user, I want to pan and zoom the image within the Profile banner aspect ratio, so that my banner fits the Profile header cleanly without unexpected cropping.
8. As a signed-in user, I want to cancel the crop dialog at any point, so that my existing avatar or banner remains unchanged and no upload is performed.
9. As a signed-in user, I want to confirm the crop and see a clear loading indicator while the cropped image is uploaded and saved, so that I know the system is working.
10. As a signed-in user, I want to see immediate visual confirmation and an updated Profile upon a successful upload, so that I know my changes took effect.
11. As a signed-in user, I want clear and actionable error messages if the upload or profile update fails, so that I can retry without losing context.
12. As a signed-in user, I want to remove my custom avatar or banner to revert to the default placeholder, so that I can reset my Profile appearance whenever I wish.
13. As a visitor, I want to view any user's Profile and see their uploaded avatar and banner rendered at optimal quality and dimensions, so that the browsing experience is visually rich.
14. As a signed-out visitor, I want avatar and banner upload controls to be hidden, so that only authenticated account owners can edit their own profiles.
15. As a maintainer, I want the ImageKit private key to stay strictly on the server, so that cloud storage authorization is not exposed to client-side tampering.
16. As a maintainer, I want image file binaries to upload directly to ImageKit from the browser, so that the Elysia API server does not consume bandwidth or memory proxying heavy file payloads.
17. As a maintainer, I want profile image updates to derive user identity exclusively from the authenticated Better Auth session, so that no user can overwrite another user's avatar or banner.
18. As a maintainer, I want old ImageKit assets deleted only after the new image reference is committed to the database, so that a failed update does not delete the user's active image.

## Implementation Decisions

- **Direct Browser-to-ImageKit Uploads**: Image binaries bypass the Elysia backend completely. The browser requests upload authentication parameters from the API, uploads the cropped image Blob directly to ImageKit, and then submits the resulting image details to the API.
- **ImageKit Upload Authorization**: The Elysia API exposes an authenticated endpoint (`/me/profile/upload-auth` or similar under the profiles module) requiring a valid Better Auth session (`auth: true`). It generates temporary authentication parameters (token, signature, expiration) using the server-side ImageKit private key.
- **Session Identification & Authorization**: The API resolves the active user from the Better Auth session cookies/headers. User IDs are never accepted from client payloads to determine which profile is updated.
- **Client-Side Image Processing & Cropping**:
  - Image files are loaded into an in-memory object URL for local preview.
  - A responsive modal crop dialog handles zooming, panning, and crop boundaries.
  - Upon user confirmation, a canvas helper outputs a cropped image Blob (e.g. `image/webp` or `image/jpeg`) for upload.
  - No network requests to ImageKit occur until the user explicitly confirms the crop.
- **Crop Aspect Ratios & Framing**:
  - Avatar: Fixed `1:1` aspect ratio with circular/square preview matching the Profile header avatar ring.
  - Banner: Fixed aspect ratio matching the Profile header banner dimensions.
- **Component Architecture & Reusability**:
  - A unified, reusable profile image uploader component handles file selection, validation, crop dialog presentation, upload orchestration, and error handling for both avatars and banners.
  - Configuration differences (aspect ratio, crop shape, target field, max file size) are passed via props.
  - UI strictly adheres to existing design tokens and shadcn component conventions (dialogs, buttons, sliders, toasts).
- **Data Persistence & Schema**:
  - Avatar image URLs are persisted to the authenticated user's account row (`user.image`).
  - Banner image URLs are persisted to the user's profile settings row (`profile.bannerImage`).
  - ImageKit file IDs may be stored alongside image URLs (or tracked via structured metadata) to enable future file lifecycle operations and deletions.
- **Old Asset Deletion Lifecycle**:
  - When replacing or removing an image, the previous ImageKit file is deleted only after the database update transaction succeeds.
  - If the database update fails, the old image is preserved and the new unlinked file is queued for cleanup.
- **Validation Rules & Limits**:
  - Client and server enforce allowed MIME types: `image/jpeg`, `image/png`, `image/webp`.
  - File size limits: Max 5 MB for avatars, max 10 MB for banners.
  - Rate limiting is applied to the upload authorization endpoint using the existing rate limit infrastructure.
- **Cache Invalidation & Navigation**:
  - Successful image updates trigger Next.js cache tag revalidation for the affected profile (`profile-${username}`) and update local client state promptly.

## Testing Decisions

- **Quality Philosophy**: Tests must exercise external contracts and observable behavior (API response shapes, HTTP status codes, authorization enforcement, schema validation) rather than internal implementation details or third-party SDK internals.
- **Modules to Test**:
  - **API Upload Auth Endpoint**: Verify that unauthenticated requests receive `401 Unauthorized`, while authenticated sessions receive valid signature, token, and expiration structures.
  - **API Profile Image Updates**: Verify that authenticated users can update their own avatar and banner, that invalid URLs or payloads return `422 Unprocessable Entity`, and that foreign user records cannot be updated.
  - **Validation & Mapping Schemas**: Test file size checks, MIME type filters, and URL validation rules.
- **Prior Art**: Follows existing API integration tests and schema tests in `packages/auth/tests/` and `packages/rich-content/tests/validate.test.ts`.
- **Manual & Build Verification**: End-to-end crop and upload flow verified via local dev environment with mock/sandbox ImageKit credentials, along with full repository typechecking (`bun run typecheck`) and build (`bun run build`).

## Out of Scope

- Video, animated GIF, or SVG upload processing and transformations.
- In-browser image filters (e.g., color tinting, saturation, brightness adjustment).
- Importing avatars automatically from external social media URLs outside of Better Auth's standard sign-up flow.
- Proxying image binaries through Elysia or Next.js server routes.
- Image uploads within rich content bios or reviews (governed separately by Rich Content policy).

## Further Notes

- Maintains strict alignment with domain terms from `CONTEXT.md`: `Profile`, `Username`, `Display Username`.
- Respects monorepo boundaries: Next.js frontend (`apps/web`) uses Eden treaty (`api-client.ts` / `server-api.ts`) to communicate with Elysia (`apps/api`), with no intermediate Next.js API route handlers.
