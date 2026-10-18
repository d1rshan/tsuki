# 0004 — Own media catalogue, sourced from Kitsu

Date: 2026-09-19
Status: Accepted

## Context

Tsuki is an anime/manga tracking service. Until now every media fact (titles,
covers, scores, popularity…) was fetched on demand from AniList's public GraphQL
API and cached in our `media` table, with browser-side search hitting AniList
directly. AniList's API Terms of Use prohibit exactly this:

> "Using the AniList API as a backup or data storage service is strictly
> prohibited."
> "Hoarding or mass collection of data from the AniList API is strictly
> prohibited."
> Competing/non-complementary use — "including, but not limited to, anime and
> manga list or tracker services" — is prohibited.

Tsuki is a tracker and persists API data, so on-demand reliance on AniList is
non-compliant and can be cut off at any time. We decided to maintain our own
media catalogue in our own Postgres database and remove the AniList dependency
entirely.

## Candidate sources

| Source                   | Verdict                                                                                                                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AniList                  | Prohibited for trackers + data storage. Rejected.                                                                                                                                       |
| MyAnimeList official API | Developer agreement is revocable at will, review-gated, and restricts server-side storage of MAL Content; `/v2` catalogue walks require user OAuth. Too fragile. Rejected.              |
| Jikan                    | Unofficial MAL scraper-as-a-service; inherits MAL's restrictions plus its own "don't abuse" stance. Rejected.                                                                           |
| **Kitsu**                | Public JSON:API (`https://kitsu.app/api/edge`), no key needed for reads, documented under **Apache 2.0**, covers anime **and** manga, and exposes every field we display. **Selected.** |

## Decision

1. **Kitsu is the single upstream source.** A new `packages/kitsu` package
   replaces `packages/anilist` and is the only place that talks to Kitsu.
   Consumers keep seeing `MediaRow` shapes — nothing downstream knows which
   provider fed the row.
2. **`media.id` becomes the Kitsu id.** Our catalog is ours; ids are stable
   integers from Kitsu. Kitsu's anime and manga share one integer id space
   (anime 1 ≠ manga 1), so the primary key is composite `(id, type)` — which
   is also what `library`, `reviews` and `activity` foreign keys reference.
3. **Nightly incremental crawl keeps the DB fresh.** The cron pass walks
   Kitsu newest-updated-first (`sort=-updatedAt`) and stops at a watermark —
   our table's `max(updated_at)`, the previous pass's coverage ceiling. A
   daily delta is small, so it fits in one cron invocation's budget. Full
   bootstrap (offset 0 over the whole collection, ~2.5h across time-boxed
   ticks) remains the manual script path, resumable via cursor state in a
   `sync_state` table.
4. **Trending becomes ours.** Instead of AniList's `TRENDING_DESC` we rank by
   local popularity (Kitsu `userCount` today, our own activity signals later).
   This is a product win, not a compromise: "what's trending _here_" was never
   truly available to us before.
5. **Fields we can't source are dropped, not faked:** `source` (media_source)
   and `season` are not provided by Kitsu and are removed; `countryOfOrigin`
   is removed. `seasonYear` is derived from `startDate`.
6. **Images are hotlinked** from Kitsu's media CDN (`media.kitsu.io` /
   `media.kitsu.app`) with attribution in the footer. Rehosting is a possible
   later upgrade (ImageKit is already in the stack) but adds GC liability for
   no immediate gain.

## Consequences

- Tsuki no longer depends on AniList availability, rate limits, or terms.
- **Amendment (migration reality):** the AniList→Kitsu crosswalk was planned
  but abandoned — the existing media row and every user row referencing it
  (library, reviews, activity) were deliberately wiped with the owner's
  approval, and the catalogue was rebuilt from Kitsu. User lists start fresh;
  nothing was silently cascaded away.
- Search moves server-side (Postgres `pg_trgm` over title columns) because the
  "cache is a strict subset, so search in browser" excuse disappears.
- We are polite citizens: conservative per-request pacing, backoff on 429/5xx,
  chunked crawling, and visible attribution to Kitsu.
- Kitsu coverage of obscure manga is smaller than AniList's; acceptable.
- If Kitsu's stance ever changes, `packages/kitsu`'s mapper is the only seam
  to replace — same as the seam `packages/anilist` used to be.
