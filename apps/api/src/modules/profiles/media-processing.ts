import { env } from "@tsuki/env/api";

import { generateImageKitUploadAuth, type ImageUploadType } from "./imagekit";

export type MediaCrop = { x: number; y: number; width: number; height: number };
const authorization = () =>
  `Basic ${Buffer.from(`${env.IMAGEKIT_PRIVATE_KEY}:`).toString("base64")}`;
const endpoint = () => env.IMAGEKIT_URL_ENDPOINT.replace(/\/$/, "");

export function sourceUploadAuth(userId: string, type: ImageUploadType, extension: string) {
  const auth = generateImageKitUploadAuth(userId, type);
  return {
    ...auth,
    folder: `/profile-uploads/${type}`,
    fileName: auth.fileName.replace(/webp$/, extension),
  };
}

async function ownedSource(fileId: string, userId: string, type: ImageUploadType) {
  const response = await fetch(
    `https://api.imagekit.io/v1/files/${encodeURIComponent(fileId)}/details`,
    { headers: { Authorization: authorization() } },
  );
  if (!response.ok) throw new Error("Upload is no longer available. Please select the file again.");
  const file = (await response.json()) as {
    filePath: string;
    url: string;
    size: number;
    width?: number;
    height?: number;
  };
  const escaped = userId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (
    !new RegExp(
      `^/profile-uploads/${type}/image-${escaped}-\\d+-[0-9a-f-]{36}\\.(jpg|png|webp|gif|mp4)$`,
    ).test(file.filePath) ||
    file.url.split("?")[0] !== `${endpoint()}${file.filePath}`
  )
    throw new Error("Invalid source upload.");
  if (file.size <= 0 || file.size > (type === "avatar" ? 5 : 10) * 1024 * 1024)
    throw new Error("Upload exceeds the size limit.");
  return { ...file, url: `${endpoint()}${file.filePath}` };
}

export async function removeSource(fileId: string, userId: string, type: ImageUploadType) {
  await ownedSource(fileId, userId, type);
  const result = await fetch(`https://api.imagekit.io/v1/files/${encodeURIComponent(fileId)}`, {
    method: "DELETE",
    headers: { Authorization: authorization() },
  });
  if (!result.ok) throw new Error("Could not clean up temporary upload.");
}

/** Named extractions preserve exact pixel coordinates for both image and video APIs. */
export function cropTransformation(
  crop: MediaCrop,
  width: number,
  height: number,
  type: ImageUploadType,
) {
  const ratio = type === "avatar" ? 1 : 3;
  if (
    crop.x < 0 ||
    crop.y < 0 ||
    crop.width < ratio * 2 ||
    crop.height < 2 ||
    crop.x + crop.width > width + 1 ||
    crop.y + crop.height > height + 1 ||
    Math.abs(crop.width / crop.height - ratio) > 0.04
  ) {
    throw new Error("Invalid crop. Please adjust the selection.");
  }
  const x = Math.floor(crop.x / 2) * 2;
  const y = Math.floor(crop.y / 2) * 2;
  // Keep the aspect ratio exact while giving H.264 even dimensions at every step.
  const h = Math.floor(Math.min(crop.height, crop.width / ratio) / 2) * 2;
  const w = h * ratio;
  return `w-${Math.floor((width - x) / 2) * 2},h-${Math.floor((height - y) / 2) * 2},cm-extract,fo-bottom_right:w-${Math.min(w, width - x)},h-${Math.min(h, height - y)},cm-extract,fo-top_left:w-${Math.min(w, type === "avatar" ? 320 : 960)},c-at_max`;
}

async function transformed(url: string, mime: string, maxBytes: number) {
  const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(20000) });
  if (response.status === 202 || response.headers.get("is-intermediate-response") === "true")
    return null;
  if (!response.ok || response.headers.get("content-type")?.split(";")[0] !== mime) {
    throw new Error("ImageKit could not process this media. Please try another file.");
  }
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength === 0 || bytes.byteLength > maxBytes)
    throw new Error("Processed media exceeds the size limit. Try a shorter loop.");
  return bytes;
}

async function store(bytes: ArrayBuffer, fileName: string, type: ImageUploadType) {
  const form = new FormData();
  form.set("file", Buffer.from(bytes).toString("base64"));
  form.set("fileName", fileName);
  form.set("folder", type === "avatar" ? "/avatars" : "/banners");
  form.set("useUniqueFileName", "false");
  const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    headers: { Authorization: authorization() },
    body: form,
  });
  if (!response.ok) throw new Error("Could not store processed media. Please retry.");
  return (await response.json()) as { url: string; fileId: string };
}

/** Retry while ImageKit returns 202. No process-local jobs or original-file dependencies remain. */
export async function processProfileMedia(
  userId: string,
  input: {
    fileId: string;
    type: ImageUploadType;
    crop: MediaCrop;
    start: number;
    duration: number;
  },
) {
  const source = await ownedSource(input.fileId, userId, input.type);
  const extension = source.filePath.split(".").at(-1)!;
  const animated = extension === "mp4" || extension === "gif";
  // Inspect WebP's feature flags server-side too, before any transformations.
  {
    const response = await fetch(source.url, { headers: { Range: "bytes=0-31" } });
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (
      bytes[20] !== undefined &&
      String.fromCharCode(...bytes.slice(12, 16)) === "VP8X" &&
      bytes[20] & 2
    )
      throw new Error("Animated WebP is not supported. Use GIF or MP4 instead.");
  }
  const metadataResponse = await fetch(
    `https://api.imagekit.io/v1/files/${encodeURIComponent(input.fileId)}/metadata`,
    { headers: { Authorization: authorization() } },
  );
  if (!metadataResponse.ok) throw new Error("Could not read media dimensions.");
  const result = (await metadataResponse.json()) as {
    width: number;
    height: number;
    duration?: number;
    metadata?: { width: number; height: number; duration?: number };
  };
  const metadata = result.metadata ?? result;
  if (!metadata.width || !metadata.height) throw new Error("Unsupported media dimensions.");
  const crop = cropTransformation(input.crop, metadata.width, metadata.height, input.type);
  const maxBytes = (input.type === "avatar" ? 5 : 10) * 1024 * 1024;
  const name = source.filePath
    .split("/")
    .at(-1)!
    .replace(/\.[^.]+$/, "");
  const videoSource = extension === "gif" ? `${source.url}/ik-gif-video.mp4` : source.url;
  const start = Number(input.start.toFixed(2));
  const duration = Number(input.duration.toFixed(2));
  const transform = animated
    ? `${crop}:so-${start},du-${duration},f-mp4,vc-h264,ac-none${extension === "mp4" ? ",ov-redirect_false" : ""}`
    : `${crop},f-webp`;
  let bytes: ArrayBuffer | null;
  try {
    bytes = await transformed(
      `${videoSource}?tr=${transform}`,
      animated ? "video/mp4" : "image/webp",
      maxBytes,
    );
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") return null;
    throw error;
  }
  if (!bytes) return null;
  // Generate the poster independently before materializing either output. This
  // avoids repeatedly uploading the MP4 while its thumbnail is still processing.
  let posterBytes: ArrayBuffer | null = null;
  if (animated) {
    const posterSource = `${source.url}/ik-thumbnail.jpg`;
    try {
      posterBytes = await transformed(
        `${posterSource}?tr=${crop}:${extension === "gif" ? "pg-1" : `so-${start}`},f-webp`,
        "image/webp",
        maxBytes,
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "TimeoutError") return null;
      throw error;
    }
    if (!posterBytes) return null;
  }
  const output = await store(bytes, `${name}.${animated ? "mp4" : "webp"}`, input.type);
  let url = output.url;
  if (posterBytes) {
    // Give the poster a separate convention-conforming id so GC can track both.
    const posterName = generateImageKitUploadAuth(userId, input.type).fileName;
    const poster = await store(posterBytes, posterName, input.type);
    url = `${poster.url}#video=${encodeURIComponent(output.url)}`;
  }
  try {
    await removeSource(input.fileId, userId, input.type);
  } catch {
    // Finished assets are independent of the source; GC retries temporary cleanup.
  }
  return url;
}
