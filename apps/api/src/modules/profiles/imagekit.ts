import crypto from "node:crypto";

import { env } from "@tsuki/env/api";

export type ImageUploadType = "avatar" | "banner";

const folderFor = (type: ImageUploadType) => (type === "avatar" ? "/avatars" : "/banners");

const authHeader = () => `Basic ${Buffer.from(`${env.IMAGEKIT_PRIVATE_KEY}:`).toString("base64")}`;

/** False when ImageKit credentials are absent — uploads must then be refused. */
export const isImageKitConfigured = () =>
  Boolean(env.IMAGEKIT_PRIVATE_KEY && env.IMAGEKIT_PUBLIC_KEY);

/**
 * Uploads use a server-mandated file name: `<folder>/image-<userId>-<uploadedAt>-<token>.webp`.
 * Ownership is then a pure string check against the URL the client reports back
 * (no ImageKit API round-trip), and the GC sweep can age files without ImageKit
 * exposing createdAt. The folder is derived from the declared upload type so
 * clients never choose one; the persisted URL is re-checked against the same
 * convention in PUT /me/profile (parseImagePath), which is the real gate —
 * ImageKit's signature only covers token+expire, so it cannot bind the folder.
 */
export function generateImageKitUploadAuth(userId: string, type: ImageUploadType) {
  const token = crypto.randomUUID();
  // Short window: the upload signature only covers token+expire, so a leaked
  // token allows uploading anywhere in the account until it expires.
  const expire = Math.floor(Date.now() / 1000) + 5 * 60;
  const fileName = `image-${userId}-${Math.floor(Date.now() / 1000)}-${token}.webp`;
  const signature = crypto
    .createHmac("sha1", env.IMAGEKIT_PRIVATE_KEY)
    .update(token + expire)
    .digest("hex");

  return {
    token,
    expire,
    signature,
    fileName,
    publicKey: env.IMAGEKIT_PUBLIC_KEY,
    folder: folderFor(type),
  };
}

const filePathPattern = (userId: string, type: ImageUploadType) =>
  new RegExp(
    `^${folderFor(type)}/image-${userId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}-\\d+-[0-9a-f-]{36}\\.(?:webp|mp4)$`,
  );

/**
 * Extracts the ImageKit file path from an uploaded image URL, provided it
 * matches the server-mandated naming convention for this user and upload type.
 * Returns null for any foreign or non-conforming URL.
 */
export function parseImagePath(url: string, userId: string, type: ImageUploadType): string | null {
  const endpoint = (env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io").replace(/\/$/, "");
  if (!url.startsWith(`${endpoint}/`)) return null;
  const path = decodeURIComponent(url.split("#")[0]!.slice(endpoint.length));
  return filePathPattern(userId, type).test(path) ? path : null;
}

const UPLOADED_AT_PATTERN =
  /-(\d+)-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(?:webp|mp4|gif|jpg|png)$/;

/** Upload epoch (seconds) from a convention-conforming file path, else null. */
export function uploadedAtFromFilePath(path: string): number | null {
  const match = UPLOADED_AT_PATTERN.exec(path);
  if (!match) return null;
  const seconds = Number(match[1]);
  return Number.isSafeInteger(seconds) && seconds > 0 ? seconds : null;
}

const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp", "video/mp4"];
const MAX_IMAGE_BYTES = { avatar: 5 * 1024 * 1024, banner: 10 * 1024 * 1024 };

/**
 * Server-side MIME/size enforcement: the binary bypasses this server, so the
 * stored file is verified via a HEAD request before its URL is persisted.
 * Returns an error message, or null when the file checks out.
 */
export async function verifyUploadedImage(
  url: string,
  type: ImageUploadType,
): Promise<string | null> {
  const video = new URLSearchParams(url.split("#")[1]).get("video");
  if (video) {
    if (!video.endsWith(".mp4") || new URL(video).hash) return "Invalid animation.";
    const error = await verifyUploadedImage(video, type);
    if (error) return error;
  }
  let response: Response;
  try {
    response = await fetch(url, { method: "HEAD" });
  } catch {
    return "Image could not be verified. Please try again.";
  }
  if (!response.ok) return "Uploaded image is not accessible. Please try again.";

  const contentType = response.headers.get("content-type")?.split(";")[0];
  if (!contentType || !ALLOWED_CONTENT_TYPES.includes(contentType)) {
    return "Unsupported image format. Please upload a JPEG, PNG, or WebP image.";
  }

  const length = Number(response.headers.get("content-length"));
  if (!Number.isSafeInteger(length) || length <= 0) {
    return "Image size could not be verified. Please try again.";
  }
  if (length > MAX_IMAGE_BYTES[type]) {
    return `Image is too large. Maximum size for ${type}s is ${MAX_IMAGE_BYTES[type] / (1024 * 1024)}MB.`;
  }

  if (contentType === "image/webp") {
    try {
      const prefix = await fetch(url.split("#")[0]!, { headers: { Range: "bytes=0-31" } });
      if (!prefix.ok) return "Image could not be verified. Please try again.";
      const bytes = new Uint8Array(await prefix.arrayBuffer());
      if (String.fromCharCode(...bytes.slice(12, 16)) === "VP8X" && (bytes[20] ?? 0) & 2)
        return "Animated WebP is not supported. Use GIF or MP4 instead.";
    } catch {
      return "Image could not be verified. Please try again.";
    }
  }
  return null;
}

export async function listImageKitFiles(
  folder: string,
): Promise<Array<{ fileId: string; filePath: string }>> {
  const files: Array<{ fileId: string; filePath: string }> = [];
  let skip = 0;
  // ponytail: page size 1000 is ImageKit's max; enough for profile images for years.
  for (;;) {
    const response = await fetch(
      `https://api.imagekit.io/v1/files?path=${encodeURIComponent(folder)}&limit=1000&skip=${skip}`,
      { headers: { Authorization: authHeader() } },
    );
    if (!response.ok) {
      throw new Error(`ImageKit list failed (${response.status}): ${await response.text()}`);
    }
    const batch = (await response.json()) as Array<{ fileId: string; filePath: string }>;
    files.push(...batch);
    if (batch.length < 1000) return files;
    skip += 1000;
  }
}

export async function bulkDeleteImageKitFiles(fileIds: string[]): Promise<boolean> {
  for (let offset = 0; offset < fileIds.length; offset += 100) {
    const batch = fileIds.slice(offset, offset + 100);
    const response = await fetch("https://api.imagekit.io/v1/files/batch/deleteByFileIds", {
      method: "POST",
      headers: { Authorization: authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({ fileIds: batch }),
    });
    if (!response.ok) {
      console.error("ImageKit bulk delete failed:", response.status);
      return false;
    }
    const result = (await response.json()) as { successfullyDeletedFileIds?: string[] };
    const deleted = new Set(result.successfullyDeletedFileIds);
    if (batch.some((id) => !deleted.has(id))) return false;
  }
  return true;
}
