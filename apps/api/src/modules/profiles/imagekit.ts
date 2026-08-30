import crypto from "node:crypto";

import { env } from "@tsuki/env/api";

export type ImageUploadType = "avatar" | "banner";
const folderFor = (type: ImageUploadType) => (type === "avatar" ? "/avatars" : "/banners");

const authHeader = () => `Basic ${Buffer.from(`${env.IMAGEKIT_PRIVATE_KEY}:`).toString("base64")}`;

/** False when ImageKit credentials are absent — uploads must then be refused. */
export const isImageKitConfigured = () =>
  Boolean(env.IMAGEKIT_PRIVATE_KEY && env.IMAGEKIT_PUBLIC_KEY);

export function generateImageKitUploadAuth(userId: string) {
  const token = crypto.randomUUID();
  // Short window: the upload signature only covers token+expire, so a leaked
  // token allows uploading anywhere in the account until it expires.
  const expire = Math.floor(Date.now() / 1000) + 5 * 60;
  // The server-mandated file name is what binds an uploaded file to this user:
  // a fileId is only trusted once ImageKit confirms its path follows this
  // convention, so clients can never claim files they didn't upload.
  const fileName = `image-${userId}-${token}.webp`;
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

async function getImageKitFilePath(fileId: string): Promise<string | null> {
  if (!fileId) return null;

  try {
    const response = await fetch(`https://api.imagekit.io/v1/files/${encodeURIComponent(fileId)}`, {
      headers: { Authorization: authHeader() },
    });
    if (!response.ok) return null;

    const file = (await response.json()) as { filePath?: string };
    return file.filePath ?? null;
  } catch (error) {
    console.error("Failed to fetch ImageKit file:", error);
    return null;
  }
}

/** True when the fileId points at this user's own upload of the given type. */
export async function isFileOwnedByUser(
  fileId: string,
  userId: string,
  type: ImageUploadType,
): Promise<boolean> {
  const filePath = await getImageKitFilePath(fileId);
  return filePath?.startsWith(`${folderFor(type)}/image-${userId}-`) ?? false;
}

export async function deleteImageKitFile(fileId: string): Promise<boolean> {
  if (!fileId) return false;

  try {
    const response = await fetch(`https://api.imagekit.io/v1/files/${encodeURIComponent(fileId)}`, {
      method: "DELETE",
      headers: { Authorization: authHeader() },
    });

    return response.ok;
  } catch (error) {
    console.error("Failed to delete ImageKit file:", error);
    return false;
  }
}
