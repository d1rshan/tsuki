# Activity is per-day Logs and per-entry Reviews

Refines [0002](./0002-friends-activity-records.md). The `activity` table stores
two event kinds. A **Log** is keyed per media per UTC day
(`sourceId = mediaId:date`). Only episode/chapter increases or effective status
changes qualify; other saves do not replace or retimestamp the card. Qualifying
same-day saves preserve opening values and update endpoints and occurrence time.
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

The heatmap remains the independent `progress` daily rollup of positive episode/
chapter deltas. Status, reviews, and volume changes do not add heatmap intensity.
Follows remain relationships in `social`, never Activity.
