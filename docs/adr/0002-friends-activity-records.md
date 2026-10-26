# Friends Activity records

The Review Activity behavior below is superseded by
[ADR 0005](0005-reviews-outside-activity.md). Activity now contains Logs only.

Friends Activity is represented by dedicated feed records rather than inferred
from current library entries, reviews, or the daily progress aggregate. A
record preserves the original action time and can update its visible snapshot
or be removed when its source is edited or deleted; this makes the social feed
truthful without turning the heatmap aggregate into an event store or retaining
an undisclosed audit trail.

See [0003](./0003-activity-per-day-logs.md) and the
[Activity/completion spec](../activity-and-completion-spec.md) for the refined
eligibility and minimal snapshots: Review Activity identifies a review without
copying its content, and only progress increases or status changes create Logs.
