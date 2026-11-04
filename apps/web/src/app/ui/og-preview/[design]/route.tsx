import { renderMediaOgImage } from "@/features/media/og-image";
import { renderProfileOgImage } from "@/features/profile/og-image";
import { renderSiteOgImage } from "@/shared/lib/site-og-image";
import { parseUsername } from "@/shared/lib/username";

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

  if (design === "profile") {
    const username = parseUsername(new URL(request.url).searchParams.get("username") ?? "");
    if (!username) return new Response("Invalid username", { status: 400 });
    return renderProfileOgImage(username);
  }

  return renderSiteOgImage();
}
