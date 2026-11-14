import { afterEach, expect, test, vi } from "vitest";

import { uploadedAtFromFilePath, verifyUploadedImage } from "../src/modules/profiles/imagekit";

afterEach(() => vi.unstubAllGlobals());

test("checks both processed files before accepting an animation", async () => {
  const request = vi
    .fn()
    .mockResolvedValue(
      new Response(null, { headers: { "content-type": "video/mp4", "content-length": "1024" } }),
    );
  vi.stubGlobal("fetch", request);
  const video = "https://ik.imagekit.io/example/loop.mp4";
  expect(
    await verifyUploadedImage(
      `https://ik.imagekit.io/example/poster.webp#video=${encodeURIComponent(video)}`,
      "avatar",
    ),
  ).toBeNull();
  expect(request).toHaveBeenCalledTimes(2);
  expect(request).toHaveBeenCalledWith(video, { method: "HEAD" });
});

test("rejects nested media references before fetching", async () => {
  const request = vi.fn();
  vi.stubGlobal("fetch", request);
  expect(
    await verifyUploadedImage(
      `https://ik.imagekit.io/poster.webp#video=${encodeURIComponent("https://ik.imagekit.io/loop.mp4#video=foreign.mp4")}`,
      "avatar",
    ),
  ).toBe("Invalid animation.");
  expect(request).not.toHaveBeenCalled();
});

test("garbage collection ages MP4 files using the same upload convention", () => {
  expect(
    uploadedAtFromFilePath(
      "/avatars/image-owner-1794664094-86dc63ec-729d-4ade-88b5-b55957d8927c.mp4",
    ),
  ).toBe(1794664094);
});
