# Activity is per-day Logs and per-entry Reviews

Refines [0002](./0002-friends-activity-records.md). The feed table is renamed
`activity` and stores exactly two event kinds. A **Log** is keyed per media
per UTC day (`sourceId = mediaId:date`): saves that day replace the card and
bump its timestamp, so watching a show on multiple days surfaces multiple
cards instead of one buried row that never re-appears. A **Review** is keyed
per media: edits replace its content in place while preserving the original
date, because reviews are published once, not incremented. Follows no longer
create Activity — the `social` table stays the relationship source of truth
and follow cards are derivable from it if ever needed.

The heatmap remains the `progress` daily rollup, deliberately not an event
store: it answers "how much" while Activity answers "what happened". A
volume-only save creates a Log but no heatmap delta; accepted (TODO at the
trigger) until volume intensity matters.
