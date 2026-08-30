import { renderMediaOgImage, ogImageSize } from "@/features/media/og-image";

export const alt = "Manga card";
export const size = ogImageSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  return renderMediaOgImage("MANGA", (await params).id);
}
