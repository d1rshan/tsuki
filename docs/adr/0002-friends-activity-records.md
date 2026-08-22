# Friends Activity records

Friends Activity is represented by dedicated feed records rather than inferred
from current library entries, reviews, or the daily progress aggregate. A
record preserves the original action time and can update its visible snapshot
or be removed when its source is edited or deleted; this makes the social feed
truthful without turning the heatmap aggregate into an event store or retaining
an undisclosed audit trail.
