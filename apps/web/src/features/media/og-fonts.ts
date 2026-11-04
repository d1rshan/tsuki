import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function getMediaOgFonts() {
  const [regular, bold] = await Promise.all([
    readFile(join(process.cwd(), "src/shared/assets/geist-regular.ttf")),
    readFile(join(process.cwd(), "src/shared/assets/geist-latin-700.woff")),
  ]);

  return [
    {
      name: "Geist",
      data: regular,
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Geist",
      data: bold,
      weight: 700 as const,
      style: "normal" as const,
    },
  ];
}
