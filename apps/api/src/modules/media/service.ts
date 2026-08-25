import { anilistMediaById } from "@tsuki/anilist";
import { mediaDal } from "@tsuki/db";

import type { MediaType } from "./model";

/**
 * Read-through cache: serve from our table, else pull from AniList and persist.
 * Null only when AniList has no such media of that type.
 *
 * Doubles as the guard before writing a library entry or review, since both
 * carry a foreign key to media and the row has to exist first.
 */
export async function ensureMedia(type: MediaType, id: number) {
  const cached = await mediaDal.getMediaById(type, id);
  // TODO: Remove after all cached external links have been backfilled with language metadata.
  if (cached && !cached.externalLinks?.some((link) => !("language" in link))) return cached;

  const fetched = await anilistMediaById(type, id);
  if (!fetched) return null;

  await mediaDal.upsertMedia([fetched]);
  return mediaDal.getMediaById(type, id);
}
