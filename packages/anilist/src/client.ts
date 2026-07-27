import { GraphQLClient } from "graphql-request";

/**
 * AniList is regularly slow or briefly unreachable — Cloudflare 522s, connection
 * resets, and a shared rate limit that answers 429. Nothing here is a mutation,
 * so every request is safe to retry.
 */
const TIMEOUT_MS = 10_000;
const MAX_ATTEMPTS = 3;
const RETRYABLE = new Set([429, 500, 502, 503, 504, 522, 524]);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Honour `Retry-After` when AniList sends one, else back off exponentially. */
function backoffMs(response: Response | null, attempt: number) {
  const retryAfter = Number(response?.headers.get("retry-after"));
  if (Number.isFinite(retryAfter) && retryAfter > 0) return retryAfter * 1000;

  return 2 ** (attempt - 1) * 500;
}

/**
 * Gives each attempt its own timeout so a hung socket cannot stall a request
 * indefinitely. Statuses outside `RETRYABLE` are handed back untouched — the 404
 * AniList answers an unknown id with has to reach `fetchMediaById`.
 */
const fetchWithRetry = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  for (let attempt = 1; ; attempt++) {
    let response: Response | null = null;

    try {
      response = await fetch(input, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (!RETRYABLE.has(response.status)) return response;
    } catch (error) {
      if (attempt === MAX_ATTEMPTS) throw error;
    }

    // Out of attempts: hand back the last retryable response so graphql-request
    // can turn it into a ClientError carrying the real status.
    if (attempt === MAX_ATTEMPTS && response) return response;

    await sleep(backoffMs(response, attempt));
  }
};

export const anilistClient = new GraphQLClient("https://graphql.anilist.co", {
  // graphql-request types this as `typeof fetch`, which under Bun also carries
  // `preconnect`. It only ever calls the function itself.
  fetch: fetchWithRetry as typeof fetch,
});
