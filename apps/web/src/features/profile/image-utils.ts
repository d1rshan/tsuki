export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
] as const;
export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_BANNER_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export type ImageUploadType = "avatar" | "banner";

export type ImageValidationResult =
  | { valid: true; error?: never }
  | { valid: false; error: string };

export function validateProfileImageFile(
  file: { size: number; type: string; name?: string },
  type: ImageUploadType,
): ImageValidationResult {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as AllowedImageType)) {
    return {
      valid: false,
      error: "Unsupported file type. Please select a JPEG, PNG, WebP, GIF, or MP4.",
    };
  }

  const maxBytes = type === "avatar" ? MAX_AVATAR_SIZE_BYTES : MAX_BANNER_SIZE_BYTES;
  const maxMb = type === "avatar" ? 5 : 10;

  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File is too large. Maximum size for ${type}s is ${maxMb}MB.`,
    };
  }

  return { valid: true };
}

export type PixelCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** WebP animation flag is carried by the VP8X chunk, independently of filename. */
export function isAnimatedWebP(bytes: Uint8Array) {
  return (
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 16)) === "WEBPVP8X" &&
    Boolean((bytes[20] ?? 0) & 2)
  );
}

export type ImageKitUploadAuth = {
  token: string;
  expire: number;
  signature: string;
  /** Server-mandated file name; binds the upload to the caller's user id. */
  fileName: string;
  publicKey: string;
  /** Server-derived destination folder, bound to the declared upload type. */
  folder: string;
};

export type ImageKitUploadResult = {
  fileId: string;
  url: string;
  name: string;
  thumbnailUrl?: string;
};

/**
 * Directly uploads a Blob to ImageKit REST API.
 */
export async function uploadBlobToImageKit({
  blob,
  auth,
}: {
  blob: Blob;
  auth: ImageKitUploadAuth;
}): Promise<ImageKitUploadResult> {
  const formData = new FormData();
  formData.append("file", blob, auth.fileName);
  formData.append("fileName", auth.fileName);
  formData.append("publicKey", auth.publicKey);
  formData.append("signature", auth.signature);
  formData.append("expire", String(auth.expire));
  formData.append("token", auth.token);
  formData.append("folder", auth.folder);
  // Uniqueness comes from the token inside the mandated file name.
  formData.append("useUniqueFileName", "false");

  const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Upload failed");
    throw new Error(`ImageKit upload failed (${response.status}): ${errorText}`);
  }

  const result = (await response.json()) as ImageKitUploadResult;
  return result;
}
