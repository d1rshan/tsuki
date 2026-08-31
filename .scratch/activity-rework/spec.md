# Activity rework: per-day Logs, content-only feeds, profile activity stream

Status: ready-for-agent

## Problem Statement

The profile's "recent activity" isn't activity — it's the user's library
entries sorted by date, with no pagination and no real events. Meanwhile the
stored activity record has two defects: re-watching a show never re-surfaces
its card (one row per media forever, timestamp frozen at first save), and
follows pollute the feed with actions that aren't about anime or manga at
all. The heatmap and the activity stream also don't agree on what a "day" of
activity means.

## Solution

Activity becomes a single event store with two event kinds: **Log** (one card
per media per UTC day, refreshed on each save) and **Review** (one card per
media, edits replace content while keeping the original date). Follows are no
longer Activity. The profile overview gains a real, paginated activity stream
built from the same event store that powers the public and following feeds.
The heatmap stays as-is: a display-only intensity view driven by the progress
rollup.

See ADR 0003 (Activity is per-day Logs and per-entry Reviews) and the
glossary entries for **Activity**, **Log**, and **Review** in CONTEXT.md.

## User Stories

1. As a profile visitor, I want to see a person's recent Logs and Reviews on their overview, so that I can see what they've been watching and writing at a glance.
2. As a profile visitor, I want a "load more" control on the activity stream, so that I can browse further back without leaving the page.
3. As a profile owner, I want re-logging a show I already logged today to update today's card instead of duplicating it, so that my stream stays clean.
4. As a profile owner, I want logging a show on a new day to create a new card, so that my history shows each day I engaged with it.
5. As a profile owner, I want the latest save of the day to set the card's timestamp and state, so that the stream reflects my most recent progress.
6. As a profile owner, I want removing an entry from my library to remove all of its Log cards, so that I don't leave stale cards behind.
7. As a profile owner, I want editing my review to update its card in place while keeping the original date, so that my followers aren't re-shown a review they've already seen.
8. As a profile owner, I want deleting my review to remove its card, so that removed content doesn't linger in feeds.
9. As a signed-in user, I want follows to not appear in Activity or the feeds, so that the streams only contain watching and writing moments.
10. As a signed-in user, I want the public feed to show all users' Logs and Reviews, so that I can discover what the community is up to.
11. As a signed-in user, I want the following feed to show Logs and Reviews only from accounts I follow, so that my feed stays relevant.
12. As a signed-in user, I want edits to someone's log or review to update the existing card, so that feeds show current state rather than outdated snapshots.
13. As a profile visitor, I want the heatmap to keep showing watching intensity only, so that reviews and social actions don't distort the picture of viewing habits.
14. As a profile visitor, I want each activity card to show the media, the actor, and the state at save time (status, score, progress) or the full review content, so that cards are self-contained.
15. As a profile owner logging a show that isn't in the database yet, I want its Activity card created with correct media references, so that first-time logs appear correctly.
16. As a developer, I want the activity store to expose one shared query for a user's paginated activity, so that profile and feed surfaces consume one source of truth.

## Implementation Decisions

**Schema (db package)**

- The `feed` table is renamed `activity` and recreated from scratch (dev-stage wipe; no data migration, no backfill).
- The activity type enum keeps exactly two values: `LOG` and `REVIEW`. `FOLLOW` is removed.
- The `targetUserId` column and its index are dropped; nothing else set them. The target-user join in the read query goes with it.
- The unique identity of a Log is `(actorId, type, sourceId)` where `sourceId` is `"<mediaId>:<UTC yyyy-mm-dd>"`. Same-day re-log upserts: snapshot replaced, `occurredAt` bumped to the latest save. A new UTC day yields a new row.
- The unique identity of a Review remains `(actorId, type, mediaId)`. Upsert on re-submission replaces the snapshot content and preserves the original `occurredAt`.
- Log snapshots carry `{ status, score, progress, progressVolumes, repeat }` — the entry's state at save time. Review snapshots carry `{ content }` — the full RichContent document, duplicated from the reviews store so cards render without extra joins.

**Writers (api modules)**

- The library logging path mirrors each save into Activity with the per-day keying; the review path keeps its existing mirror semantics (per-media, original date preserved).
- Removing a library entry deletes all of that entry's Log rows. Removing a review deletes its Review row (existing behavior).
- The social follow/unfollow path stops writing Activity entirely.
- The logging path remains the only library write path, so no other mirrors are needed today.

**Readers (db + api + web)**

- One new shared query: a user's Activity, newest-first, cursor-paginated (same occurredAt + id keyset pattern as the existing feed queries), filtered by actor. It powers the profile stream.
- Public and following feed queries keep their current shape; FOLLOW rows simply cease to exist.
- The profile overview's activity section is backed by an endpoint that takes a username plus cursor, is public to any visitor, and returns the same card shape the feeds use.
- The profile overview replaces the library-derived "recent activity" list with the activity stream and an inline "load more" (infinite cursor query on the web side, mirroring the social feed's existing hook pattern). The section stays on the overview page — no new route.
- Feed/activity card components are shared between profile and social surfaces; the FOLLOW card rendering is deleted.
- The heatmap is untouched: display-only, driven by the `progress` rollup, no click behavior. A TODO comment goes on the progress trigger noting that volume-only saves produce a Log but no heatmap delta (deliberate, per ADR 0003).

**Conventions**

- Day boundary for Log keying is UTC, consistent with the progress rollup and heatmap.
- Review edits preserve the original date (confirmed decision; also current behavior).

## Testing Decisions

- Good tests here assert external behavior only: given inputs, what rows/outputs come out — never internal call ordering or SQL shape.
- Keep to the repo's existing practice: pure-function vitest unit tests, no DB harness. Prior art: the api package's existing unit tests and the web/package `tests/` directories.
- Test the logic-rich pure units introduced by this work: UTC day-key derivation for Log sourceIds, cursor serialization/deserialization for the activity query, and the snapshot builders for Log and Review cards.
- Database behavior (per-day upsert, timestamp bump, cascade deletion of Logs on entry removal, trigger interaction) is verified manually for now; a DB test harness is deliberately out of scope.

## Out of Scope

- Clickable heatmap days (explicitly dropped).
- Any Activity for follows, favorites, or other social actions; "X follows Y" surfacing anywhere.
- Follow-activity derivation from the social table.
- Volume increases counting toward heatmap intensity.
- A dedicated activity tab/route on profiles (`/<username>/activity`).
- Migrating or backfilling existing feed rows (dev wipe instead).
- A database test harness / integration tests.
- Feed sparsity controls (e.g., muting a heavy logger), notification surfaces, or RSS-style exports.

## Further Notes

- CONTEXT.md already carries the updated **Activity**, **Log**, and **Review** definitions; ADR 0003 records the decision rationale. Implementers should treat the glossary as normative naming.
- Pre-launch status makes the table drop safe; if the app ships before this lands, revisit the wipe decision.
- The progress trigger comment (volumes TODO) is the only change to the heatmap path.
