import { siteUrl } from "@/shared/lib/site";

import { getMedia } from "../data";
import { mediaSlug, normalizeMedia, parseMediaId } from "../media";

type MediaJsonLdProps = {
  mediaType: "ANIME" | "MANGA";
  id: string;
};

export async function MediaJsonLd({ mediaType, id }: MediaJsonLdProps) {
  const mediaId = parseMediaId(id);
  if (!mediaId) return null;

  const media = await getMedia(mediaType, mediaId);
  if (!media) return null;

  const normalized = normalizeMedia(media);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": mediaType === "ANIME" ? "TVSeries" : "Book",
          name: normalized.title,
          description: normalized.descriptionText,
          url: `${siteUrl}/${mediaSlug(mediaType)}/${mediaId}`,
          image: normalized.coverImage ?? undefined,
        }).replace(/</g, "\\u003c"),
      }}
    />
  );
}
