# Friends Activity

Status: ready-for-agent

## Problem Statement

Friends currently lets signed-in users discover Profiles, but it does not show
what people they Follow are doing. Users need a chronological Activity Feed in
the same product area, with a wider Public view for discovery.

## Solution

Extend Friends with three top-level tabs: Following, Public, and Discover.
Following is the default tab and shows retained Activity from accounts the
viewer currently Follows. Public shows Activity from every user, including the
viewer. Discover preserves the existing username search and Popular on Tsuki
experience.

Activity is stored as dedicated feed records. It is not inferred from current
library entries, reviews, or the daily progress aggregate used by the Profile
heatmap. Records are created only for actions made after this feature launches.
They preserve the original action time, but their visible snapshot updates when
the source action is edited and is removed when the source is deleted. No old
content or deletion event is retained for the feed.

## User Stories

1. As a signed-in user, I want Friends to open on Following, so that I can see
   what accounts I currently Follow have been doing.
2. As a signed-in user, I want a Public tab, so that I can discover Activity
   from every user, including my own.
3. As a signed-in user, I want a Discover tab, so that I retain Username
   Search and Popular on Tsuki.
4. As a signed-in user, I want Activity ordered newest first and to be able to
   load older Activity, so that both feeds remain usable as they grow.
5. As a signed-in user, I want a single card for one logging action, so that a
   progress, status, and rating change made together does not flood the feed.
6. As a signed-in user, I want Activity for anime and manga, so that both
   tracking experiences are equally social.
7. As a signed-in user, I want cards to open the actor Profile and related
   title, so that I can explore the person and media behind an action.
8. As a signed-in user, I want review cards to show their complete content,
   while spoiler-marked reviews require an explicit reveal, so that the feed
   is useful without forcing spoilers on me.
9. As an author, I want edits reflected in the original Activity card without
   moving it later in the feed, so that the feed is chronological without
   duplicate events.
10. As an author, I want deleted reviews and logs to disappear from Activity,
    so that deleted content is not retained as a public audit trail.
11. As a signed-in user, I want Following to include Activity made before I
    Followed an account and to remove it when I unfollow, so that it reflects
    the accounts I follow now.

## Activity Included

- Logging actions, including associated progress, status, ratings, and
  rewatches, represented by one card per user action.
- New reviews and edits to reviews.
- New Follows. Unfollows do not create Activity.

## Implementation Decisions

- Both Following and Public are authenticated Friends views.
- Both feeds use stable cursor pagination in newest-first order.
- Following evaluates the Follow relationship when read. It excludes the
  viewer and includes all retained Activity by their current Followed accounts,
  regardless of when the Follow was created.
- Public includes Activity from all users, including the viewer.
- Feed records begin at launch; existing library entries and reviews are not
  backfilled because they cannot provide trustworthy action history.
- A source action creates a dedicated feed record with its actor, action type,
  related media or Follow target, renderable snapshot, and occurrence time.
- An edit updates the existing record's renderable snapshot without changing
  its occurrence time. Deletion removes the record and retains neither old
  content nor a visible removal event.
- Review cards link to the actor's Reviews section because Tsuki has no
  standalone review-detail route.

## Testing Decisions

- Do not add automated tests, browser checks, or agent-browser verification
  for this feature.
- Verify the implementation with the repository typecheck and build only.

## Web Implementation Conventions

- Prefer the smallest clear implementation: compact simple guards, no
  unnecessary wrappers, props, types, Tailwind classes, or default-behavior
  utility classes.
- Build composable, feature-specific building blocks rather than preserving
  the current Friends component structure for its own sake. Refactor or
  replace it when that produces a simpler result.
- Keep the web boundary as `app/` routing and session/parameter handling,
  then feature views, layouts when a layout is warranted, and reusable
  components. Views own meaningful page logic; building blocks used by only
  one view stay local to that view, while genuinely shared ones belong in the
  feature's `components/` directory.
- Keep query and mutation logic out of UI building blocks. Give each component
  only the props it needs.
- Before handoff, make a deliberate simplification pass to remove needless
  extraction, wrappers, utilities, props, and complexity.

## Out of Scope

- Private Profiles, per-Activity visibility, hidden Follow graphs, and Follow
  approval.
- Likes, comments, reposts, and Activity-driven notifications.
- Backfilling or reconstructing historical Activity.
- A standalone review-detail page.
- Visible unfollow or deletion events.
- Audit retention of edited or deleted feed content.

## Further Notes

This is the follow-on to `.scratch/social-discovery/spec.md`, whose first
release deliberately excluded an Activity Feed. It follows the Activity,
Activity Feed, Follow, Friends, Profile, and Username definitions in
`CONTEXT.md`, and ADR 0002 records why feed records are distinct from the
daily heatmap aggregate.
