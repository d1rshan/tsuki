import { mediaDal } from "@tsuki/db";

import type { MediaType } from "./model";

/**
 * Pure existence check against our catalogue (ADR 0004): no remote fallback.
 * Null means the crawl hasn't reached this title — routes return 404 and
 * library/review writes fail with their not-found error until then.
 *
 * Doubles as the guard before writing a library entry or review, since both
 * carry a foreign key to media and the row has to exist first.
 */
export async function ensureMedia(type: MediaType, id: number) {
  return mediaDal.getMediaById(type, id);
}
