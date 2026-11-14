import { afterEach, expect, test, vi } from "vitest";

vi.mock("@tsuki/env/api", () => ({
  env: {
    IMAGEKIT_URL_ENDPOINT: "https://ik.imagekit.io/test",
    IMAGEKIT_PRIVATE_KEY: "test",
    IMAGEKIT_PUBLIC_KEY: "test",
  },
}));

import { cropTransformation, processProfileMedia } from "../src/modules/profiles/media-processing";

const name = "image-owner-1794672000-86dc63ec-729d-4ade-88b5-b55957d8927c";
const input = {
  fileId: "source",
  type: "banner" as const,
  crop: { x: 20, y: 50, width: 600, height: 200 },
  start: 0.3,
  duration: 2,
};
const details = {
  filePath: `/profile-uploads/banner/${name}.mp4`,
  url: `https://ik.imagekit.io/test/profile-uploads/banner/${name}.mp4?updatedAt=1234`,
  size: 1000,
};
const json = (value: unknown) =>
  new Response(JSON.stringify(value), { headers: { "content-type": "application/json" } });
afterEach(() => vi.unstubAllGlobals());

test("preserves exact drag coordinates using supported named video extractions", () => {
  expect(cropTransformation(input.crop, 640, 360, "banner")).toBe(
    "w-620,h-310,cm-extract,fo-bottom_right:w-600,h-200,cm-extract,fo-top_left:w-600,c-at_max",
  );
  expect(() => cropTransformation({ ...input.crop, x: 900 }, 640, 360, "banner")).toThrow(
    "Invalid crop",
  );
});

test("pending ImageKit processing retains the source and never publishes a replacement", async () => {
  const request = vi
    .fn()
    .mockResolvedValueOnce(json(details))
    .mockResolvedValueOnce(new Response(new Uint8Array(32)))
    .mockResolvedValueOnce(json({ metadata: { width: 640, height: 360 } }))
    .mockResolvedValueOnce(new Response(null, { status: 202 }));
  vi.stubGlobal("fetch", request);
  expect(await processProfileMedia("owner", input)).toBeNull();
  expect(request).toHaveBeenCalledTimes(4);
});

test("materializes video and poster before deleting the original", async () => {
  const calls: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, options?: RequestInit) => {
      calls.push(`${options?.method ?? "GET"} ${url}`);
      if (url.endsWith("/details")) return json(details);
      if (url.endsWith("/metadata")) return json({ metadata: { width: 640, height: 360 } });
      if (options?.method === "DELETE") return new Response(null, { status: 204 });
      if (url.includes("files/upload"))
        return json({
          url: `https://ik.imagekit.io/test/banners/${calls.length === 6 ? name + ".mp4" : name + ".webp"}`,
          fileId: "output",
        });
      if (url.includes("ik-thumbnail"))
        return new Response(new Uint8Array(50), { headers: { "content-type": "image/webp" } });
      if (url.includes("?tr="))
        return new Response(new Uint8Array(100), { headers: { "content-type": "video/mp4" } });
      return new Response(new Uint8Array(32));
    }),
  );
  expect(await processProfileMedia("owner", { ...input, duration: 1.9000000000000001 })).toContain(
    "#video=",
  );
  expect(calls.find((call) => call.includes("vc-h264"))).toContain("du-1.9,");
  expect(calls.at(-1)).toBe("DELETE https://api.imagekit.io/v1/files/source");
  expect(calls.filter((call) => call.startsWith("POST"))).toHaveLength(2);
});

test("rejects an animated WebP even when disguised as an MP4", async () => {
  const bytes = new Uint8Array(32);
  bytes.set(new TextEncoder().encode("VP8X"), 12);
  bytes[20] = 2;
  const request = vi
    .fn()
    .mockResolvedValueOnce(json(details))
    .mockResolvedValueOnce(new Response(bytes));
  vi.stubGlobal("fetch", request);
  await expect(processProfileMedia("owner", input)).rejects.toThrow(
    "Animated WebP is not supported",
  );
  expect(request).toHaveBeenCalledTimes(2);
});

test("foreign sources are rejected before reading or processing media", async () => {
  const request = vi
    .fn()
    .mockResolvedValue(
      json({ ...details, filePath: details.filePath.replace("owner", "someone-else") }),
    );
  vi.stubGlobal("fetch", request);
  await expect(processProfileMedia("owner", input)).rejects.toThrow("Invalid source upload");
  expect(request).toHaveBeenCalledTimes(1);
});

test("rounds video crop stages to even dimensions", () => {
  expect(
    cropTransformation({ x: 227.4, y: 35.2, width: 290.3, height: 290.3 }, 640, 360, "avatar"),
  ).toBe(
    "w-414,h-326,cm-extract,fo-bottom_right:w-290,h-290,cm-extract,fo-top_left:w-290,c-at_max",
  );
});
