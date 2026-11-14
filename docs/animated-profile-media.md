# Animated profile media

Avatar and banner uploads accept JPEG, PNG, WebP, GIF and MP4 within the existing 5 MB / 10 MB limits. Crop before saving; MP4 supports a start offset and a loop of up to six seconds. Changing the crop requires uploading again.

A lazily loaded, single-thread FFmpeg worker processes media locally. Originals never upload. Static files become WebP; animations become H.264 MP4 without audio plus a WebP poster. Animated WebP uses the browser's ImageDecoder (currently requires a browser that supports that API); unsupported browsers show an actionable error. Processing failures leave the existing media intact.

Development and build scripts copy the installed, pinned engine assets into ignored `public/media-engine`; no third-party CDN is required. The engine is roughly 32 MB and downloads only when processing an upload.

The stored URL points at the poster. Its `#video=` fragment contains the encoded MP4 URL, preserving still images in existing thumbnails and share cards without schema changes. Profile playback respects reduced motion, offers pause/play, and falls back to the poster on playback errors. The API checks ownership and type/size of both files before saving. Cancelled or replaced files remain eligible for the existing ImageKit GC after its 48-hour grace period; referenced animation files are retained alongside posters. Worker termination and object URL cleanup release local temporary data.
