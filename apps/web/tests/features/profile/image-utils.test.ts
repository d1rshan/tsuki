import { describe, expect, test } from "vitest";

import {
  ALLOWED_IMAGE_TYPES,
  MAX_AVATAR_SIZE_BYTES,
  MAX_BANNER_SIZE_BYTES,
  validateProfileImageFile,
} from "@/features/profile/image-utils";

describe("validateProfileImageFile", () => {
  test("allows supported image formats within size limit for avatars", () => {
    for (const type of ALLOWED_IMAGE_TYPES) {
      const result = validateProfileImageFile(
        { size: 1024 * 1024, type }, // 1MB
        "avatar",
      );
      expect(result.valid).toBe(true);
    }
  });

  test("allows supported image formats within size limit for banners", () => {
    for (const type of ALLOWED_IMAGE_TYPES) {
      const result = validateProfileImageFile(
        { size: 6 * 1024 * 1024, type }, // 6MB (valid for banner, invalid for avatar)
        "banner",
      );
      expect(result.valid).toBe(true);
    }
  });

  test("rejects files exceeding avatar size limit (5MB)", () => {
    const result = validateProfileImageFile(
      { size: MAX_AVATAR_SIZE_BYTES + 1, type: "image/jpeg" },
      "avatar",
    );
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("5MB");
    }
  });

  test("rejects files exceeding banner size limit (10MB)", () => {
    const result = validateProfileImageFile(
      { size: MAX_BANNER_SIZE_BYTES + 1, type: "image/png" },
      "banner",
    );
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("10MB");
    }
  });

  test("rejects unsupported MIME types", () => {
    const unsupported = [
      "image/gif",
      "image/svg+xml",
      "application/pdf",
      "text/plain",
      "video/mp4",
    ];

    for (const type of unsupported) {
      const result = validateProfileImageFile({ size: 1024, type }, "avatar");
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("Unsupported file type");
      }
    }
  });
});
