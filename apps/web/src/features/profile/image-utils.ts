export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
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
      error: "Unsupported file type. Please select a JPEG, PNG, or WebP image.",
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

/**
 * Creates a cropped Blob from an HTMLImageElement using an offscreen canvas.
 */
export async function getCroppedImageBlob(
  image: HTMLImageElement,
  crop: PixelCrop,
  outputType: "image/webp" | "image/jpeg" = "image/webp",
  quality = 0.92,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(crop.width);
  canvas.height = Math.round(crop.height);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas 2D context");
  }

  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, canvas.width, canvas.height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas to Blob conversion failed"));
        }
      },
      outputType,
      quality,
    );
  });
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
