import crypto from "node:crypto";

import { env } from "@tsuki/env/api";

export function generateImageKitUploadAuth() {
  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 30 * 60;
  const privateKey = env.IMAGEKIT_PRIVATE_KEY || "";
  const signature = crypto
    .createHmac("sha1", privateKey)
    .update(token + expire)
    .digest("hex");

  return {
    token,
    expire,
    signature,
    publicKey: env.IMAGEKIT_PUBLIC_KEY || env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
    urlEndpoint: env.IMAGEKIT_URL_ENDPOINT || env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
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
