import { notFound } from "next/navigation";

import type { MediaType } from "@tsuki/api/types";

import { getMedia } from "../data";
import { parseMediaId } from "../media";
import { MediaDetails } from "./media-details";

export async function MediaView({ mediaType, id }: { mediaType: MediaType; id: string }) {
  const mediaId = parseMediaId(id);
  if (!mediaId) notFound();

  const media = await getMedia(mediaType, mediaId);
  if (!media) notFound();

  return <MediaDetails media={media} />;
}
