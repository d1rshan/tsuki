import crypto from "node:crypto";
import { describe, expect, test } from "vitest";

import { app } from "../src/app";
import { generateImageKitUploadAuth, deleteImageKitFile } from "../src/modules/profiles/imagekit";

describe("ImageKit upload auth generation", () => {
  test("generates valid token, expire timestamp, and hmac sha1 signature", () => {
    const auth = generateImageKitUploadAuth("user-1", "avatar");

    expect(auth.token).toBeDefined();
    expect(typeof auth.token).toBe("string");
    expect(auth.token.length).toBeGreaterThan(0);

    // The server-mandated file name binds the upload to the caller.
    expect(auth.fileName).toMatch(/^image-user-1-[0-9a-f-]{36}\.webp$/);

    expect(typeof auth.expire).toBe("number");
    const nowSeconds = Math.floor(Date.now() / 1000);
    // Short window: the signature doesn't bind folder/size, so tokens must
    // expire quickly.
    expect(auth.expire - nowSeconds).toBeGreaterThanOrEqual(295);
    expect(auth.expire - nowSeconds).toBeLessThanOrEqual(305);

    expect(typeof auth.signature).toBe("string");
    expect(auth.signature).toMatch(/^[a-f0-9]{40}$/);
  });

  test("signature matches HMAC-SHA1 calculation with private key", () => {
    const auth = generateImageKitUploadAuth("user-1", "banner");
    const expected = crypto
      .createHmac("sha1", process.env.IMAGEKIT_PRIVATE_KEY || "")
      .update(auth.token + auth.expire)
      .digest("hex");

    expect(auth.signature).toBe(expected);
  });
});

describe("ImageKit delete helper", () => {
  test("returns false when fileId is empty", async () => {
    const result = await deleteImageKitFile("");
    expect(result).toBe(false);
  });
});

describe("Profiles API endpoints", () => {
  test("unauthenticated request to /me/profile/upload-auth returns 401", async () => {
    const response = await app.handle(
      new Request("http://localhost/me/profile/upload-auth?type=avatar", {
        method: "GET",
      }),
    );

    expect(response.status).toBe(401);
  });

  test("unauthenticated request to PUT /me/profile returns 401", async () => {
    const response = await app.handle(
      new Request("http://localhost/me/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: "https://ik.imagekit.io/tsuki/avatar.webp",
          avatarFileId: "new-file-id",
          bannerImage: "https://ik.imagekit.io/tsuki/banner.webp",
          bannerFileId: "new-banner-file-id",
        }),
      }),
    );

    expect(response.status).toBe(401);
  });
});
