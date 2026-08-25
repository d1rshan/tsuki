import { ClientError, GraphQLClient, type Variables } from "graphql-request";

// AniList is regularly slow or briefly unreachable, and nothing here is a
// mutation, so every request is safe to retry.
const TIMEOUT_MS = 10_000;
const MAX_ATTEMPTS = 3;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryable = (status: number) => status === 429 || status >= 500;

function backoffMs(response: Response | null, attempt: number) {
  const retryAfter = Number(response?.headers.get("retry-after"));
  if (Number.isFinite(retryAfter) && retryAfter > 0) return retryAfter * 1000;

  return 2 ** (attempt - 1) * 500;
}

/** Each attempt gets its own timeout, so a hung socket cannot stall a request. */
const fetchWithRetry = async (
  input: string | URL | Request,
  init?: RequestInit,
): Promise<Response> => {
  for (let attempt = 1; ; attempt++) {
    let response: Response | null = null;

    try {
      response = await fetch(input, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (!isRetryable(response.status)) return response;
    } catch (error) {
      if (attempt === MAX_ATTEMPTS) throw error;
    }

    // Hand the last response back so graphql-request can raise the real status.
    if (attempt === MAX_ATTEMPTS && response) return response;

    await sleep(backoffMs(response, attempt));
  }
};

const anilistClient = new GraphQLClient("https://graphql.anilist.co", {
  // Typed as `typeof fetch`, which under Bun also carries `preconnect`, but
  // graphql-request only ever calls the function itself.
  fetch: fetchWithRetry as typeof fetch,
});

/** Any AniList failure — unreachable, timed out, or a non-2xx from their API. */
export class AnilistError extends Error {
  constructor(
    message: string,
    /** AniList's HTTP status, absent when we never got a response. */
    readonly status?: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "AnilistError";
  }
}

/** The one way in, so callers only ever have to know about AnilistError. */
export async function anilistRequest<T>(query: string, variables?: Variables) {
  try {
    return await anilistClient.request<T>(query, variables);
  } catch (error) {
    if (error instanceof ClientError) {
      const { status } = error.response;
      throw new AnilistError(`AniList responded ${status}`, status, { cause: error });
    }

    throw new AnilistError("AniList is unreachable", undefined, { cause: error });
  }
}
