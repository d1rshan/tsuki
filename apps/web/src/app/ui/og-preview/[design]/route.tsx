import { ImageResponse } from "next/og";

import { renderMediaOgImage } from "@/features/media/og-image";
import { OgCard } from "@/shared/components/og-card";
import { buildMinimalOgCard, buildProfileOgCard } from "@/shared/lib/og-card";
import { siteDescription } from "@/shared/lib/site";

export async function GET(request: Request, { params }: { params: Promise<{ design: string }> }) {
  const { design } = await params;
  if (!["site", "profile", "media"].includes(design)) {
    return new Response("Not found", { status: 404 });
  }

  if (design === "media") {
    const params = new URL(request.url).searchParams;
    const type = params.get("type");
    const id = params.get("id");
    if ((type !== "ANIME" && type !== "MANGA") || !id || !/^[1-9]\d*$/.test(id)) {
      return new Response("Invalid media", { status: 400 });
    }
    return renderMediaOgImage(type, id);
  }

  const layout =
    design === "site"
      ? buildMinimalOgCard("Tsuki", siteDescription)
      : buildProfileOgCard({
          displayUsername: "moonwatcher",
          bio: "Watching one episode at a time.",
        });

  return new ImageResponse(<OgCard layout={layout} />, {
    width: 1200,
    height: 630,
  });
}
