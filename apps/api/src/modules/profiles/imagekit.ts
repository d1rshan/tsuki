import crypto from "node:crypto";

import { env } from "@tsuki/env/api";

export function generateImageKitUploadAuth() {
  const token = crypto.randomUUID();
  // Short window: the upload signature only covers token+expire, so a leaked
  // token allows uploading anywhere in the account until it expires.
  const expire = Math.floor(Date.now() / 1000) + 5 * 60;
  const privateKey = env.IMAGEKIT_PRIVATE_KEY || "";
  const signature = crypto
    .createHmac("sha1", privateKey)
    .update(token + expire)
    .digest("hex");

  return {
    token,
    expire,
    signature,
    publicKey: env.IMAGEKIT_PUBLIC_KEY,
    urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
  };
}

export async function deleteImageKitFile(fileId: string): Promise<boolean> {
  const privateKey = env.IMAGEKIT_PRIVATE_KEY;
  if (!fileId || !privateKey) return false;

  try {
    const authHeader = `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}`;
    const response = await fetch(`https://api.imagekit.io/v1/files/${encodeURIComponent(fileId)}`, {
      method: "DELETE",
      headers: {
        Authorization: authHeader,
      },
    });

    return response.ok;
  } catch (error) {
    console.error("Failed to delete ImageKit file:", error);
    return false;
  }
}
