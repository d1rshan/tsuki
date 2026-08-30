import crypto from "node:crypto";
import { describe, expect, test } from "vitest";

import { app } from "../src/app";
import {
  generateImageKitUploadAuth,
  parseImagePath,
  uploadedAtFromFilePath,
} from "../src/modules/profiles/imagekit";

describe("ImageKit upload auth generation", () => {
  test("generates valid token, expire timestamp, and hmac sha1 signature", () => {
    const auth = generateImageKitUploadAuth("user-1");

    expect(auth.token).toBeDefined();
    expect(typeof auth.token).toBe("string");
    expect(auth.token.length).toBeGreaterThan(0);

    // The server-mandated file name binds the upload to the caller.
    expect(auth.fileName).toMatch(/^image-user-1-\d+-[0-9a-f-]{36}\.webp$/);

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
    const auth = generateImageKitUploadAuth("user-1");
    const expected = crypto
      .createHmac("sha1", process.env.IMAGEKIT_PRIVATE_KEY || "")
      .update(auth.token + auth.expire)
      .digest("hex");

    expect(auth.signature).toBe(expected);
  });
});

describe("ImageKit path convention", () => {
  const endpoint = process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io";

  test("parses the file path from a convention-conforming URL", () => {
    const auth = generateImageKitUploadAuth("user-1");
    const url = `${endpoint}/avatars/${auth.fileName}`;

    expect(parseImagePath(url, "user-1", "avatar")).toBe(`/avatars/${auth.fileName}`);
    expect(parseImagePath(url, "other-user", "avatar")).toBeNull();
    expect(parseImagePath(url, "user-1", "banner")).toBeNull();
    expect(parseImagePath(`${endpoint}/avatars/fake.webp`, "user-1", "avatar")).toBeNull();
    expect(parseImagePath("https://example.com/avatars/x.webp", "user-1", "avatar")).toBeNull();
  });

  test("extracts the upload epoch from a convention-conforming path", () => {
    const auth = generateImageKitUploadAuth("user-1");
    const path = `/avatars/${auth.fileName}`;

    expect(uploadedAtFromFilePath(path)).toBe(Math.floor(Date.now() / 1000));
    expect(uploadedAtFromFilePath("/avatars/some-random-file.webp")).toBeNull();
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
          image: "https://ik.imagekit.io/tsuki/avatars/image-x.webp",
          bannerImage: "https://ik.imagekit.io/tsuki/banners/image-x.webp",
        }),
      }),
    );

    expect(response.status).toBe(401);
  });
});
