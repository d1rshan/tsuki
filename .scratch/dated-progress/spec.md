# Dated progress spec

## Goal

Record when users watched anime episodes or read manga chapters. Make the
heatmap reflect those dates, including corrections, while keeping Activity a
separate social feed.

Development data can be cleared; preserving or reconstructing existing history
is not required.

## Model

Add a **progress session** for each recorded range of episodes or chapters:

- User, media ID and media type.
- Inclusive start and end numbers; amount is `end - start + 1`.
- Watched/read calendar date (`YYYY-MM-DD`), nullable when unknown.
- Creation and update timestamps, separate from the watched/read date.

Sessions for the same user and title must not overlap within a watch/read.
Gaps are allowed. Validate ranges and reject conflicts on the server, including
concurrent writes. Manga volumes, status, ratings and reviews do not count
toward sessions or the heatmap.

The library retains its current progress counter. On a progress increase,
create a session for the newly added range and update the counter atomically.
Changing a session's date does not change library progress. Editing its range
or deleting it must reconcile the counter with the remaining history in the
same atomic operation. Define the counter as the highest remaining endpoint,
or zero when no sessions remain; gaps therefore do not imply watched dates.
Do not silently delete or change other sessions to make an edit fit.

Repeated watches/reads need a separate watch/read identity to allow the same
range to be counted again. Full repeat-session tracking is out of scope; do
not count overlapping ranges as new progress until that model exists.

## Logging and dates

- Show **Watched on** for anime and **Read on** for manga when recording a
  progress increase. Default to the user's local calendar day.
- Allow a past date or **I don't remember**. Unknown is stored as null; never
  infer a date for it. Save calendar dates without timezone conversion.
- An increase from 3 to 6 records one session covering 4–6 on the selected
  date, not separate invented dates for each episode or chapter.
- Provide a way to view, edit and delete individual sessions. A date edit
  targets an existing session; changing a date in a new progress save must
  not silently move earlier sessions.
- Keep title-level start and finish dates optional and editable under more
  options. They are summaries, do not drive the heatmap, and must not be
  inferred from an old completed entry.
- Preserve existing completion behavior when progress reaches a known total.

## Heatmap

Compute daily anime and manga amounts by summing dated progress sessions for
each user and date. Unknown dates are excluded. Calculate on read initially;
add a derived aggregate only if performance requires it. Any future aggregate
must be updated atomically on session insert, edit and delete.

Remove the existing trigger on library progress and its daily rollup as the
heatmap source. A date edit moves the session's full amount from its old day
to its new day; a range edit changes its amount; deletion removes it. No
separate manual heatmap correction should be necessary.

## Activity

Keep Activity separate from progress sessions. Qualifying progress and status
changes continue to produce one Activity Log per title per UTC posting day,
ordered by save time. A watched/read date edit alone does not create, move or
retimestamp an Activity card. Activity is not the source for heatmap totals;
its snapshot may remain unchanged when historical sessions are corrected.
Reviews remain outside Activity.

This changes the independent heatmap rollup specified in
[ADR 0003](../../docs/adr/0003-activity-per-day-logs.md), while retaining its
per-posting-day Activity behavior. Update the ADR and domain documentation
when implementing; distinguish Activity Logs from progress sessions.

## Acceptance criteria

- Logging episodes 4–6 for Nov 1 adds 3 anime units to Nov 1. Moving the
  session to Oct 30 removes those 3 from Nov 1 and adds them to Oct 30.
- Editing the range or deleting the session updates the heatmap and reconciles
  library progress. Overlapping ranges are rejected, including concurrent
  requests; failed writes leave library and sessions unchanged.
- An unknown date adds no heatmap units; assigning or clearing its date adds
  or removes its contribution. Dates remain unchanged across timezones.
- Multiple sessions on the same date sum correctly, separately for anime and
  manga. Status-only and review changes add no heatmap units.
- Editing a session date leaves its Activity card's posting time unchanged.
- New writes cannot increment both the old trigger rollup and session totals.
