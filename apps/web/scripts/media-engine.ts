import { cp, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const target = join(dirname(fileURLToPath(import.meta.url)), "../public/media-engine");
await mkdir(target, { recursive: true });
for (const [name, source] of [
  ["worker", dirname(import.meta.resolve("@ffmpeg/ffmpeg").replace("file://", ""))],
  ["core", dirname(import.meta.resolve("@ffmpeg/core").replace("file://", ""))],
] as const)
  await cp(source, join(target, name), { recursive: true });
