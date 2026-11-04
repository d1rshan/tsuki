import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { OgCard } from "@/shared/components/og-card";
import { buildMediaOgCard, buildMinimalOgCard, buildProfileOgCard } from "@/shared/lib/og-card";
import { siteDescription } from "@/shared/lib/site";

export async function GET(_request: Request, { params }: { params: Promise<{ design: string }> }) {
  const { design } = await params;
  if (!["site", "profile", "media"].includes(design)) {
    return new Response("Not found", { status: 404 });
  }

  let layout;
  if (design === "site") {
    layout = buildMinimalOgCard("Tsuki", siteDescription);
  } else if (design === "profile") {
    layout = buildProfileOgCard({
      displayUsername: "moonwatcher",
      bio: "Watching one episode at a time.",
    });
  } else {
    const image = await readFile(join(process.cwd(), "public/ui-preview/landscape.jpg"));
    const artwork = `data:image/jpeg;base64,${image.toString("base64")}`;
    layout = buildMediaOgCard({
      title: "A Place Beyond the Stars",
      type: "ANIME",
      bannerImage: artwork,
      coverImage: artwork,
    });
  }

  return new ImageResponse(<OgCard layout={layout} />, { width: 1200, height: 630 });
}
