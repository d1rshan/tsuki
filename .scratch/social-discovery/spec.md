# Social discovery and canonical profile URLs

Status: ready-for-agent

## Problem Statement

Tsuki users can Follow each other, but they cannot discover people within the
product. Profiles also use an implementation-oriented URL instead of a simple,
shareable public identity URL. Users need a clear Friends area for finding and
Following people, and every Profile needs a canonical URL at
`tsuki.fun/<username>`.

## Solution

Make each public Profile available at `/<username>` and preserve its existing
Profile sections beneath that URL. Add an authenticated Friends area at
`/friends`, available from the navbar, where users can browse Popular on Tsuki
and use debounced Username Search. A result opens the Profile or lets the
viewer create or remove a Follow directly. The first release deliberately
contains no activity feed, contact matching, name search, or recommendation
signals beyond follower-count popularity.

## User Stories

1. As a Tsuki user, I want my Profile at `/<username>`, so that I can share a
   short, memorable public URL.
2. As a Tsuki user, I want my existing Profile overview to remain available at
   its canonical root URL, so that moving the URL does not remove profile
   content.
3. As a Tsuki user, I want Favorites, Library, Reviews, Followers, and
   Following to remain reachable beneath my Profile URL, so that I retain the
   established Profile navigation.
4. As a signed-in user, I want the navbar Profile link to open my own canonical
   Profile, so that I can reach my page in one action.
5. As a prospective member or shared-link visitor, I want a public Profile URL
   to resolve without entering the app first, so that Profiles can be shared.
6. As an account creator or editor, I want root application-route names to be
   unavailable as Usernames, so that my Profile URL cannot conflict with an
   application page.
7. As a maintainer, I want the reserved-Username list clearly documented near
   validation, so that it is updated when a new root application route is
   introduced.
8. As a signed-in user, I want a Friends navbar destination, so that I can
   discover people without already knowing a direct Profile URL.
9. As a signed-in user, I want Friends to show Popular on Tsuki before I
   search, so that I can discover active people immediately.
10. As a signed-in user, I want Popular on Tsuki to show up to 24 people with
    the highest follower counts, so that popularity has a simple and
    understandable meaning.
11. As a signed-in user, I want myself omitted from Popular on Tsuki and
    Username Search results, so that every listed person is actionable.
12. As a signed-in user, I want to search by Username prefix, so that I do not
    have to know the entire Username before finding someone.
13. As a signed-in user, I want Username Search to react after a short typing
    pause and retain prior results while it updates, so that searching feels
    responsive without excessive requests.
14. As a signed-in user, I want Username Search to match only Usernames, so
    that Friends does not silently become a display-name or full-name search.
15. As a signed-in user, I want result cards to show an avatar and Display
    Username and open the matching Profile, so that I can identify and inspect
    a person before Following them.
16. As a signed-in user, I want Follow, Following, and Follow back controls in
    Friends results, so that I can manage the existing one-way Follow
    relationship without leaving the page.
17. As a signed-in user, I want a clear initial search state and a clear
    no-match state, so that I understand what Username Search is doing.
18. As a signed-in user, I want Friends to require authentication, so that the
    directory remains an in-product social feature while Profiles stay public.
19. As a future Tsuki user, I want Friends to have room for Activity and
    Discover, so that an activity feed can be added without replacing the
    discovery destination.

## Implementation Decisions

- A Profile's canonical public URL is `/<username>`. Username is the
  lowercased, unique lookup identity; Display Username is the casing presented
  to people in the interface.
- Existing Profile sections move under the canonical Profile URL. The legacy
  `/profile/<username>` route is removed, with no redirect because there are
  no users or shared links to migrate.
- Username validation reserves every existing root application route,
  including the new `friends` route. The reserved list carries a maintenance
  comment requiring updates whenever root routes are added. Old Usernames are
  not reserved after a rename.
- `/friends` is authenticated and added to the primary navbar. The current
  user's navbar Profile link uses their canonical Profile URL.
- Friends is the stable product area for discovery now and followed-user
  Activity later. When Activity exists, Friends presents Activity and Discover
  tabs; this release implements only discovery.
- The default Friends list is Popular on Tsuki: at most 24 users ordered by
  follower count descending, then account creation time descending, excluding
  the viewer.
- Username Search accepts a non-empty Username prefix only. It is debounced
  using the app's existing debounce and TanStack Query conventions, preserves
  prior results while a changed query is pending, and uses the app's existing
  loading, error, and empty-state patterns.
- A discovery API contract provides bounded Popular on Tsuki and Username
  Search results. Both return the public user summary and the viewer's Follow
  relationship needed to render direct Follow controls; no full-name or
  Display Username matching is included.
- Result cards show avatar and Display Username, link to the person's Profile,
  and expose the existing Follow action and labels: Follow, Following, and
  Follow back.
- The empty query displays Popular on Tsuki. A non-empty query with no result
  displays a no-match message containing the attempted Username query.

## Testing Decisions

- Tests verify externally observable behavior rather than component internals
  or query-cache implementation details.
- Add focused automated coverage for Username validation and the user
  discovery API contract: reserved Username rejection, prefix-only matching,
  popularity ordering and limit, viewer exclusion, and Follow relationship
  data in returned summaries.
- Reuse the existing API module-test style and existing Username-schema test
  style as prior art.
- Do not add browser or end-to-end tests for this feature. Manual testing will
  validate the integrated route migration, navbar links, Friends UI states,
  search interaction, and Follow actions after implementation.

## Out of Scope

- A followed-user activity feed.
- Taste-overlap, mutual-Follow, contact-import, or other recommendation
  signals.
- Display-name, real-name, email, or general people search.
- Private Profiles, hidden follow graphs, follow approval, or friend requests.
- Username history, old-Profile redirects, or reserving a user's former
  Username.
- Browser or end-to-end test automation.

## Further Notes

This spec follows the Profile, Username, Display Username, Follow, Friends,
Username Search, and Popular on Tsuki definitions in `CONTEXT.md` and the
root-route decision in ADR 0001. The existing global navbar media-search
interaction remains scoped to Discover; Friends owns its page-local Username
Search.
