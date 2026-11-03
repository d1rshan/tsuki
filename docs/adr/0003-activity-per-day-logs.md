# Activity is per-day Logs and per-entry Reviews

Refines [0002](./0002-friends-activity-records.md). The `activity` table stores
two event kinds. A **Log** is keyed per media per UTC day
(`sourceId = mediaId:date`). Only episode/chapter increases or effective status
changes qualify; other saves do not replace or retimestamp the card. Qualifying
same-day saves preserve opening values and update endpoints and occurrence time.
Snapshots retain a `statusChanged` marker when a real transition occurs, so a
same-day reversal back to the opening status remains visible.
The pre-save library entry supplies eligibility and progress baselines; a
correction resets the baseline for the next increase.

A **Review** is keyed per media. It identifies the author and title and links to
the matching fragment on Profile Reviews. Full content belongs exclusively to
`reviews`; Activity stores no review document or HTML. Edits preserve the
review's original creation date; deleting a source removes its Activity.

[Activity and automatic completion](../activity-and-completion-spec.md) refines
these rules: known positive episode/chapter totals normalize status to Completed
before library persistence and Activity evaluation. Snapshots contain only
progress and status before/after values, never score, repeat count, or volumes.
Historical Logs without a proven increase are removed rather than inventing
past status changes; Review summaries are rebuilt from current reviews.

The dated-progress specification supersedes the daily rollup: the heatmap sums
inclusive ranges in `progress_session` by consumption calendar date and media
type, excluding unknown dates. Session edits and deletions reconcile the library
counter atomically to the highest remaining endpoint (zero with no history).
Gaps are permitted; overlaps within a title are rejected, including concurrent
writes. Repeated watches/reads require a future separate identity.
Session corrections leave Activity snapshots and UTC posting timestamps intact.
Status, reviews, and volume changes do not add heatmap intensity.
Follows remain relationships in `social`, never Activity.
