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
 * exposing createdAt.
 */
export function generateImageKitUploadAuth(userId: string) {
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
    urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
  };
}

const filePathPattern = (userId: string, type: ImageUploadType) =>
  new RegExp(
    `^${folderFor(type)}/image-${userId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}-\\d+-[0-9a-f-]{36}\\.webp$`,
  );

/**
 * Extracts the ImageKit file path from an uploaded image URL, provided it
 * matches the server-mandated naming convention for this user and upload type.
 * Returns null for any foreign or non-conforming URL.
 */
export function parseImagePath(url: string, userId: string, type: ImageUploadType): string | null {
  const endpoint = (env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io").replace(/\/$/, "");
  if (!url.startsWith(`${endpoint}/`)) return null;
  const path = decodeURIComponent(url.slice(endpoint.length));
  return filePathPattern(userId, type).test(path) ? path : null;
}

const UPLOADED_AT_PATTERN =
  /-(\d+)-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/;

/** Upload epoch (seconds) from a convention-conforming file path, else null. */
export function uploadedAtFromFilePath(path: string): number | null {
  const match = UPLOADED_AT_PATTERN.exec(path);
  if (!match) return null;
  const seconds = Number(match[1]);
  return Number.isSafeInteger(seconds) && seconds > 0 ? seconds : null;
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
  if (fileIds.length === 0) return true;

  const response = await fetch("https://api.imagekit.io/v1/files/bulkDelete", {
    method: "POST",
    headers: { Authorization: authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify({ fileIds }),
  });
  if (response.ok) return true;
  console.error("ImageKit bulk delete failed:", await response.text());
  return false;
}
