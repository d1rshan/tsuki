# Activity and automatic completion spec

The Review Activity requirements below are superseded by
[ADR 0005](adr/0005-reviews-outside-activity.md). Reviews are now read directly
from the reviews table and do not participate in Activity.

## Goal

Make Activity describe only meaningful changes to a user's anime or manga
tracking: episode/chapter progress increases, status changes, and reviews. Stop
copying review text into Activity. Automatically mark a title completed when
its known episode or chapter total is reached, in both the editor and API.

This spec refines [ADR 0002](adr/0002-friends-activity-records.md) and
[ADR 0003](adr/0003-activity-per-day-logs.md). It preserves the current model
of one Log per media per UTC day and one Review per media.

## Terms and existing behavior

- **Log** is an Activity record associated with a library entry. A Log is
  upserted by user, media, and UTC day.
- **Review** is an Activity record associated with the user's review of a
  media item.
- **Progress** means the anime episode count or manga chapter count in the
  library entry. Manga volume progress is not a feed event.
- **Status** is one of the existing list statuses: Current, Planning,
  Completed, Dropped, Paused, or Repeating.
- **Total** is the media catalogue's known episode count for anime or known
  chapter count for manga. An unknown or nonpositive total is not a completion
  boundary.

Today, every library save writes a Log containing a snapshot of current
progress, status, score, volume progress, and repeat count. That means rating,
favorite-only, and no-op saves can create or update feed cards. Review
Activity copies the full Rich Content review into its snapshot. The public
feed, Following feed, and Profile Activity stream query the same Activity
records. The heatmap is separate: it reads the daily `progress` aggregate
written by a database trigger.

## Required behavior

### 1. Activity event eligibility

Only these changes create or update visible Activity:

1. **Progress increase:** the saved episode/chapter count is greater than the
   count in the library entry before the save.
2. **Status change:** the effective saved status differs from the status in
   the library entry before the save. Creating an entry with an explicit
   status counts as a change from no status.
3. **Review create or edit:** a nonempty review is submitted.

Each Log save may qualify through progress, status, or both. Score, favorite,
volume progress, repeat count, notes, dates, and other library fields do not
qualify on their own. A progress decrease or correction does not qualify.
Saving identical relevant values does not qualify. Deleting a review removes
its Review Activity; deleting a library entry removes all its Log Activity.

When a save qualifies, store the resulting effective status and the data
needed to describe the qualifying progress or status change. Do not store a
score, repeat count, volume progress, review document, or review HTML in the
Activity snapshot.

### 2. Log identity and same-day saves

Keep one Log row per user, media, and UTC day. Qualifying saves on that day
update that row; qualifying saves on another day create a new row. A
qualifying save moves the row timestamp to the latest qualifying save. A
save that changes only excluded fields must not create a Log, replace a Log
snapshot, or bump its timestamp.

When a day has multiple qualifying saves, retain enough information to show
all qualifying dimensions for that day:

- Keep the opening progress and final progress for the day's progress range.
- Keep the status before the day's first status change and the final status.
- If a later save changes progress or status again, update the endpoint while
  preserving the day's opening value.
- Do not count a progress decrease as an activity. It resets the progress
  baseline for subsequent increases; it must not be presented as progress
  earned. An increase after a decrease is measured from the decreased value.
- If status changes more than once on the same day, show the final status and
  the status at the start of that day's first status change.
  Preserve a `statusChanged` marker so returning to that opening status still
  describes a real change, rather than becoming indistinguishable from a no-op.

The entry's state before the save is authoritative for eligibility and
baselines. Do not infer eligibility only from a prior Activity snapshot: a
prior same-day row may reflect an earlier increase, while a later correction
may have reset the current library progress.

### 3. Activity card wording

Remove the generic “Updated Title” fallback. Every stored Activity row must
have a supported visible meaning:

- **Progress only:** “Watched episodes 13–15 of Title” or “Read chapters
  13–15 of Title”. When no earlier baseline is available, describe the
  resulting count (“Watched 15 episodes of Title”) without claiming a range.
- **Status only:** “Changed status to Completed for Title” (use the
  media-specific status label where applicable, such as Watching or
  Rewatching). This describes the resulting status.
- **Progress and status:** show both facts in the same card, for example
  “Watched episodes 13–15 of Title · changed status to Completed”.
- **Review:** “Reviewed Title” and a link to the author's review on their
  Profile Reviews page. Do not show review text or a preview in Activity.

If a Log row has no supported progress increase or status transition, it is
not a valid visible Activity row and should not be returned by Activity
queries. Do not render “Updated”, “Rated”, or another generic substitute.

Cards continue to show the media cover/title and relative time. Social cards
also show the actor's Profile link and avatar. The public, Following, and
Profile streams use the same event wording and Review destination. Profile
wording may remain verb-first where it does not change the event meaning.

### 4. Review storage and destination

The `reviews` table remains the source of truth for full review content.
Activity Review records store only enough information to identify the
reviewed media and author: event type, source identity, media ID/type, and
occurrence time. Do not copy Rich Content into the Activity JSON snapshot or
render it through the Activity API.

Make each rendered review on `/<username>/reviews` a stable fragment target.
Use a deterministic identifier based on media type and media ID, for example
`review-anime-42` or `review-manga-42`. A Review card links to:

`/<username>/reviews?type=ANIME#review-anime-42`

Use `type=MANGA` for manga reviews. The fragment must resolve to the review
item after the selected media-type filter is applied. The destination should
work for logged-out visitors wherever the Profile is public, and preserve
existing Profile access rules for private Profiles.

### 5. Automatic completion

When a save's effective progress reaches or exceeds a known positive total,
set its effective status to Completed before persisting the library entry
and before evaluating Activity. The API is authoritative; the frontend
provides immediate matching feedback.

- Anime uses the catalogue's episode total. Manga uses its chapter total.
- Reaching the total (`progress >= total`) sets Completed. If the catalogue
  count is unknown, null, or zero, do not infer completion.
- The API must enforce this even when a caller sends another status or
  bypasses the web form.
- The media logging form must set its visible status to Completed as soon as
  progress reaches the known total, and reflect the resulting value in the
  submitted payload.
- If the user lowers progress below the total, do not automatically change
  Completed back to another status. Preserve the user's selected/current
  status unless they choose a different one.
- If the backend changes the status to Completed as a result of progress,
  that is a status change for Activity purposes. A single Log may describe
  both the progress increase and the completion transition.
- Apply the rule to both anime and manga.

## Persistence and migration

Update the Activity snapshot contract and API response model so the schema
cannot carry review content, score, repeat count, or volume progress as
Activity data. Keep `contentHtml` out of the Activity wire response. Review
content remains available through the existing Reviews endpoint and Profile
Reviews page.

Existing Activity rows need a data migration or equivalent one-time cleanup:

- Rebuild one minimal Review Activity from each current review, retaining the
  review's original creation time and media identity. Ensure deleted reviews
  do not leave Review Activity behind.
- Retain historical Log rows only when the stored snapshot proves a progress
  increase (a stored progress baseline lower than its progress value).
- Remove rating-only, volume-only, correction-only, and other Log rows that
  cannot be shown under the new event rules. Historical status transitions
  cannot be reliably reconstructed from the current snapshot-only records;
  do not invent them during migration. New status changes are recorded from
  this change forward.
- After cleanup, Activity queries must not leak or render legacy review text
  or generic Log rows.

The heatmap's `progress` aggregation remains independent and retains its
current meaning. Its trigger continues to count positive episode/chapter
progress deltas. This work does not add status or review counts to the
heatmap.

## Implementation work

1. **Define the new snapshot and event rules** in the DB schema and API model.
   Remove the Rich Content snapshot field and obsolete score/repeat/volume
   fields; add explicit before/after values needed for progress and status
   phrasing. Keep source IDs and uniqueness aligned with existing Log and
   Review identities.
2. **Normalize completion in the API** before writing the library row. Load
   the catalogue total for the media type, derive effective status, compare
   the pre-save library entry with the normalized entry, then write a Log
   only when progress increased or effective status changed. Keep the library
   save behavior for excluded fields even when no Activity is written.
3. **Preserve daily Log semantics** while building snapshots from the
   pre-save entry and existing same-day snapshot. Ensure a nonqualifying save
   cannot overwrite or retimestamp an already qualifying same-day card.
4. **Update the media logging form** so progress at or above a known total
   selects Completed immediately. Ensure manual status selection and
   subsequent progress edits produce a consistent payload, with the backend
   applying the authoritative rule.
5. **Update card phrasing and rendering** to support progress, status,
   progress plus status, and review summary/link. Remove rating wording,
   disabled score/detail rendering, and the generic fallback. Keep public,
   Following, and Profile cards aligned.
6. **Add stable IDs to Profile review items** and construct Review Activity
   links with the correct media-type query and fragment.
7. **Update Activity API serialization and persistence cleanup** so review
   text never leaves the Reviews path and unsupported historical rows are
   removed or filtered.
8. **Revise documentation and tests** that currently describe full review
   snapshots, score-only cards, or unrelated saves creating Logs. Cover
   progress/status eligibility, same-day accumulation, completion, and
   Review links without mirroring implementation internals.

## Acceptance criteria

- Increasing anime progress from 199 to 200 when the known total is 200
  persists progress 200 and status Completed, even if the request supplied a
  different status. The form shows Completed before submission.
- The equivalent manga chapter case behaves the same way.
- Unknown totals do not trigger automatic completion.
- Decreasing progress, changing only score/repeat/favorite/volumes/notes, or
  saving unchanged values creates no Activity and does not alter an existing
  Log card's snapshot or timestamp.
- A progress increase creates a Log whose sentence states the earned range
  when its baseline is known, or the final count when it is not.
- A status-only change creates a clear status card. A save that both
  increases progress and changes status shows both in one card.
- Multiple qualifying saves in one UTC day update one card while preserving
  that day's opening and final values. A progress decrease resets the baseline
  used for later progress increases.
- A review create/edit creates one Review Activity per media. Activity stores
  no review body and displays “Reviewed Title” with a working link to the
  matching review item on the Profile Reviews page.
- Public, Following, and Profile Activity show the same supported event types.
- No Activity card displays “Updated Title”, “Rated Title”, or full review
  content. No unsupported legacy row is returned as a visible card.
- Deleting a review removes its Review Activity; deleting a library entry
  removes its Log Activity. The progress heatmap continues to use the separate
  daily aggregate.

## Out of scope

- Adding a standalone Review detail route.
- Changing the review editor, review storage format, score storage in the
  library, or favorite behavior.
- Adding volume progress or non-progress library fields to the Activity
  feed.
- Changing Follow relationships or the heatmap's daily aggregation model.
