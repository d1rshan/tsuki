import { afterEach, expect, test, vi } from "vitest";

import {
  bulkDeleteImageKitFiles,
  uploadedAtFromFilePath,
  verifyUploadedImage,
} from "../src/modules/profiles/imagekit";

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

test("profile saves reject animated WebP even outside the normal processing flow", async () => {
  const bytes = new Uint8Array(32);
  bytes.set(new TextEncoder().encode("VP8X"), 12);
  bytes[20] = 2;
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(
        new Response(null, { headers: { "content-type": "image/webp", "content-length": "1024" } }),
      )
      .mockResolvedValueOnce(new Response(bytes)),
  );
  expect(await verifyUploadedImage("https://ik.imagekit.io/test/avatar.webp", "avatar")).toContain(
    "Animated WebP is not supported",
  );
});

test("GC deletes in batches of 100 through ImageKit's supported endpoint", async () => {
  const request = vi.fn(
    async (_url: string, options: RequestInit) =>
      new Response(
        JSON.stringify({ successfullyDeletedFileIds: JSON.parse(String(options.body)).fileIds }),
      ),
  );
  vi.stubGlobal("fetch", request);
  expect(
    await bulkDeleteImageKitFiles(Array.from({ length: 101 }, (_, index) => String(index))),
  ).toBe(true);
  expect(request).toHaveBeenCalledTimes(2);
  expect(request.mock.calls[0]?.[0]).toBe("https://api.imagekit.io/v1/files/batch/deleteByFileIds");
});

test("GC reports partial deletion as failure", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ successfullyDeletedFileIds: [] }), { status: 207 }),
      ),
  );
  expect(await bulkDeleteImageKitFiles(["file"])).toBe(false);
});
