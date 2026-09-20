import type { KitsuIncluded, KitsuMedia, KitsuPage } from "./types";

// Kitsu is a public read API and nothing here mutates, so every request is
// safe to retry.
const BASE = "https://kitsu.app/api/edge";
const TIMEOUT_MS = 10_000;
const MAX_ATTEMPTS = 3;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryable = (status: number) => status === 429 || status >= 500;

function backoffMs(response: Response | null, attempt: number) {
  const retryAfter = Number(response?.headers.get("retry-after"));
  if (Number.isFinite(retryAfter) && retryAfter > 0) return retryAfter * 1000;

  return 2 ** (attempt - 1) * 500;
}

/**
 * JSON:API query-string builder. Brackets in keys like `page[limit]` must be
 * percent-encoded; `encodeURIComponent` does exactly that, keys and values
 * alike. Undefined and null params are dropped rather than stringified.
 */
export function buildQueryString(
  params: Record<string, string | number | boolean | null | undefined>,
) {
  const pairs: string[] = [];

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  }

  return pairs.join("&");
}

/** Any Kitsu failure — unreachable, timed out, or a non-2xx from their API. */
export class KitsuError extends Error {
  constructor(
    message: string,
    /** Kitsu's HTTP status, absent when we never got a response. */
    readonly status?: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "KitsuError";
  }
}

export async function kitsuRequest<T>(
  path: string,
  params: Record<string, string | number | boolean | null | undefined>,
) {
  const query = buildQueryString(params);
  const url = `${BASE}${path}${query ? `?${query}` : ""}`;

  for (let attempt = 1; ; attempt++) {
    let response: Response | null = null;

    try {
      response = await fetch(url, {
        headers: { Accept: "application/vnd.api+json" },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!isRetryable(response.status)) {
        if (response.ok) return (await response.json()) as T;
        throw new KitsuError(`Kitsu responded ${response.status}`, response.status);
      }
    } catch (error) {
      if (error instanceof KitsuError && !isRetryable(error.status ?? 0)) throw error;
      if (attempt === MAX_ATTEMPTS) {
        if (error instanceof KitsuError) throw error;
        throw new KitsuError("Kitsu is unreachable", undefined, { cause: error });
      }
    }

    await sleep(backoffMs(response, attempt));
  }
}

type CollectionType = "anime" | "manga";

/** One raw page of a collection — the sync engine's unit of work. */
export async function kitsuFetchPage(
  type: CollectionType,
  offset: number,
  limit: number = 20,
  include?: string,
) {
  return kitsuRequest<KitsuPage<KitsuMedia, KitsuIncluded>>(`/${type}`, {
    "page[offset]": offset,
    "page[limit]": limit,
    include,
  });
}

/**
 * Walks a collection page by page until links.next is exhausted, handing each
 * page's rows to `onPage`. Time-boxing is the sync engine's job — this only
 * stops when Kitsu runs out.
 */
export async function kitsuWalk(
  type: CollectionType,
  { onPage, limit = 20 }: { onPage: (rows: KitsuMedia[]) => void; limit?: number },
) {
  for (let offset = 0; ; offset += limit) {
    const page = await kitsuFetchPage(type, offset, limit);
    if (page.data.length === 0) return;
    onPage(page.data);
    if (!page.links?.next) return;
  }
}
