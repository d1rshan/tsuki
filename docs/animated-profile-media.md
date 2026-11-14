# Animated profile media

Avatar and banner uploads accept JPEG, PNG, static WebP, GIF and MP4 within the existing 5 MB / 10 MB limits. Animated WebP is rejected in the browser and API. Crop before applying; MP4 supports a start offset and a loop of up to six seconds. Changing the crop requires uploading again.

The browser only previews the crop and trim. It directly uploads the original into `/profile-uploads/avatar` or `/profile-uploads/banner`, then asks the authenticated API to process it with ImageKit. The API checks source ownership and dimensions, constructs the transformations, and polls ImageKit's pending responses. Exact drag coordinates use two named extractions supported by both the image and video APIs. Static files become WebP; GIF and MP4 become silent H.264 MP4 with a static WebP poster.

Once both transformations are ready, the API stores independent processed assets in `/avatars` or `/banners` and deletes the temporary original. The current profile media stays intact until processing succeeds and the user saves the profile. Failures keep the editor open for retry or file replacement; temporary uploads are cleaned up on failure. Abandoned originals and unused processed outputs fall back to the existing 48-hour ImageKit GC grace period.

The stored URL points at the poster. Its `#video=` fragment contains the encoded MP4 URL, preserving still images in existing thumbnails and share cards without schema changes. Profile animations autoplay muted and loop without playback buttons, including for viewers using reduced motion, as requested. Playback failures show the poster. GC retains both referenced files.

No FFmpeg, WebAssembly, generated engine assets, or browser video conversion is required.
