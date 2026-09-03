# Activity Cards v2

Status: ready-for-agent

## Problem Statement

Activity cards (the Log/Review rows shown in the social feed and on a Profile) read awkwardly: ratings render as a bare "8/10", repeat counts as "×3", and there is no honest English for how much was watched in a sitting — the card says "watched 12 episodes of" even when the person had already watched 11 before today. The cards also show no artwork, so the feed is a wall of text. A single shared component serves both surfaces even though their purposes differ: the feed should surface what friends did, while the Profile should summarize the person's own tracking. Reviews carry a "View review" button that doesn't earn its place, and on a Profile the full review text is redundant — you're already on the reviewer's page.

## Solution

Split Activity rendering into two purpose-built components — a Social Activity card for the Activity Feed and a Profile Activity card for Profiles — both anchored by the media's cover image (already available in the query payload). Rewrite the phrase generation so every displayed fact reads as natural English: progress deltas ("watched episodes 13–15 of Frieren"), scores ("rated it 8/10"), repeat counts ("for the 3rd time"). Track per-day progress deltas in the Log snapshot so ranges can be stated truthfully. Drop the "View review" button and, on Profiles, reduce Review cards to a single phrase.

## User Stories

1. As a feed reader, I want Activity cards to read as natural English sentences, so that scanning the feed feels like reading what friends did, not decoding fields.
2. As a feed reader, I want to see "watched episodes 13–15 of Frieren" when someone watched three more episodes today, so that I know what happened _today_ rather than their lifetime total.
3. As a feed reader, I want chapter and volume progress stated as ranges too ("read chapters 4–9 of", "read volumes 3–4 of"), so that manga Activity reads as naturally as anime Activity.
4. As a feed reader, I want rewatch Activity to show ranges as well ("rewatched episodes 5–12 of"), so that a rewatch session is as informative as a first watch.
5. As a feed reader, I want a score-only save to read "rated Frieren 8/10", so that a rating change isn't presented as a non-sequitur after a progress sentence.
6. As a feed reader, I want repeat counts to read "for the 3rd time", so that I don't have to interpret "×3".
7. As a feed reader, I want each Activity card to show the media's cover image, so that I can recognize shows and manga at a glance.
8. As a feed reader, I want the media title and cover image to link to the media's page, so that I can jump to it from the feed.
9. As a feed reader, I want the actor's name and avatar to link to their Profile, so that I can visit the person behind an Activity.
10. As a feed reader, I want a friend's Review to show its full rendered content inline, so that I can read the review without leaving the feed.
11. As a feed reader, I want the feed to contain at most one card per media per day per person, so that binge sessions don't flood the feed with "watched one more episode" rows.
12. As a feed reader, I want a card with a missing media record to degrade gracefully ("Unknown Title" + placeholder artwork), so that a deleted or missing entry doesn't break the feed.
13. As a Profile visitor, I want Activity cards to read as verb-first statements ("Watched episodes 13–15 of Frieren"), so that the sentences make sense without a username prefix.
14. As a Profile visitor, I want a Review card to show only "Reviewed Frieren" (phrase only, no content), so that the Profile overview stays a summary rather than duplicating the reviews page.
15. As a Profile visitor, I want Log cards to show the same cover image, phrase, and detail line as the feed, so that the Profile feels consistent with the rest of the product.
16. As a Profile owner, I want no whole-card click target on my Activity cards, so that a stray click doesn't yank me somewhere unexpected.
17. As a Profile visitor, I want media title and cover to link to the media page and no other links on Profile cards, so that navigation intent stays explicit.
18. As a user who logs progress, I want same-day saves to extend the day's range ("watched episodes 5–12") rather than reset it, so that my day's card tells the whole session's story.
19. As a user who logs across days, I want tomorrow's card to pick up where today's left off ("episodes 13–15" after "1–12"), so that each day's card states only that day's progress.
20. As a user who corrects progress downward, I want the card to fall back to state phrasing ("watched 12 episodes of") instead of a nonsense negative range, so that corrections don't produce lies.
21. As a user logging a show for the first time, I want the card to say "watched 12 episodes of" without an invented range, so that the card doesn't assume where I started.
22. As a user, I want the "View review" button removed from Review cards, so that cards don't carry navigation I never asked for.
23. As a user, I want timestamps to read as relative time ("2 days ago") with the full date on hover, so that cards stay compact but remain precise when needed.

## Implementation Decisions

- **No schema change for covers.** The activity query already joins the full media row (cover image included) and the payload carries it; the cards simply render it. Cover rendering falls back to a placeholder block + "Unknown Title" when the join misses.
- **Delta tracking via the Log snapshot, not a new column.** The JSONB Log snapshot gains an optional `progressFrom` field (no migration). The Library writer computes it when a day's Log row is first created: it looks up the most recent prior Log Activity for the same (actor, media) and stores that row's final progress as the baseline. Same-day re-upserts extend `progress` but keep the original `progressFrom`, so the day's range always spans the whole session. Days whose save had no progress are skipped as baselines (the search continues to the last row that had one).
- **Delta semantics.** Range = baseline + 1 → new progress ("episodes 13–15" after ending yesterday at 12). If new progress ≤ baseline (a downward correction) or there is no prior baseline, no `progressFrom` is stored and the card falls back to state phrasing. This honors ADR 0003: one Log per media per UTC day, same-day saves replace the card and bump its timestamp.
- **Phrase engine is the single source of English.** The existing phrase module is extended to produce every lead/detail string: range leads ("watched episodes 13–15 of"), state leads ("watched 12 episodes of"), score-only leads ("rated"), planning tails, repeat suffix ("for the 3rd time"), and a verb-first mode for Profile cards (capitalized, no actor). Details row omits progress when the lead carries a range or count. Review cards use "reviewed" / "Reviewed".
- **Two components replace one.** A Social Activity card (feed row: small ~56px 3:4 cover thumb, text block with actor + phrase + relative timestamp, full rendered review content, no "View review" button, no whole-card click) lives in the social feature; a Profile Activity card (bento tile in the existing Profile section style, larger ~80–96px cover, verb-first phrase, Review cards phrase-only, no whole-card click) lives in the profile feature. Both consume the same wire payload (`Activity` with `snapshot`, `actor`, `media`); only the phrase mode and layout differ.
- **Links are explicit, never card-wide.** Actor name/avatar → Profile; media title and cover image → media page. Review cards carry no additional navigation.
- **API payload unchanged.** `toWire()`'s pre-rendered `snapshot.contentHtml` and the existing cursor pagination stay as-is; this is a writer-side snapshot field plus a client-side rendering change.
- Existing per-day upsert keys, REVIEW date preservation, and the progress heatmap rollup are untouched.

## Testing Decisions

- Good tests assert external behavior only: given inputs, what English comes out; given a previous snapshot and a new entry state, what snapshot gets stored. No assertions on internal helpers or rendering internals.
- **Snapshot builders** (existing test file for the API's activity/library services) gain cases for the delta function: first-ever log (no baseline), same-day extension (baseline preserved), new-day chaining (13–15 after 12), downward correction (no range), no-progress prior day (skipped as baseline), volumes and chapters.
- **Phrase module** (existing web test file) gains cases for range leads per media type and unit, score-only leads, repeat suffix, verb-first mode, and the fallbacks (unknown status, missing progress).
- No component tests: the repo has no component-test infrastructure and these cards are layout over already-tested logic. Verified by typecheck and the dev loop.

## Out of Scope

- Per-review detail pages or any deep-linking into a single Review.
- Storing media titles or cover URLs on the activity record (denormalization).
- Reworking the Activity Feed's tabs, cursor pagination, or the Discover panel.
- Heatmap/progress-rollup changes, including volume-only heatmap deltas (open TODO in ADR 0003).
- New Activity types beyond Log and Review.

## Further Notes

- Implementation note (2026-09): the snapshot gained a second optional baseline field, `progressVolumesFrom`, alongside `progressFrom` — story 3's volume ranges need their own baseline. Same mechanism, same skip/correction semantics, still no migration.
- Wire model note for implementers: `MediaCompact` already includes cover URLs in multiple sizes; the cards pick the appropriate size for their thumbnail dimensions.
- The delta baseline lookup is the only new DB read on the write path; it runs once per day per (actor, media) thanks to the upsert, not on every save.
- ADR 0002 and 0003 (activity records, per-day Logs) remain the governing decisions; this spec only enriches what a Log card can honestly say.
