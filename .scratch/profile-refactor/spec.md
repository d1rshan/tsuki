# Profile refactor

Status: ready-for-agent

## Problem Statement

Profiles work, but their implementation is fragmented across many single-purpose modules, duplicates data and route validation work, mixes client orchestration with UI, and explicitly disables instant navigation. Error handling and mutation outcomes are inconsistent, and Follow behavior is incorrectly owned by Profile even though Friends also uses it. The UI also carries avoidable wrappers, props, and styling that duplicate shadcn defaults.

## Solution

Refactor the entire Profile surface into a small, conventional feature structure without changing its public URLs, access rules, content, or intended interactions. Make all Profile routes instant-navigable through cached public data and narrowly streamed viewer-specific work, simplify the feature into composable building blocks, centralize its server/data/schema/util responsibilities, and move shared Follow behavior to Social.

## User Stories

1. As a visitor, I want to open a Profile by Username at its existing public URL, so that shared Profile links remain stable.
2. As a visitor, I want malformed or reserved Profile URLs to remain unavailable, so that application routes and Profiles cannot collide.
3. As a visitor, I want to move between a Profile's Overview, Favorites, Library, Reviews, Followers, and Following routes immediately, so that Profile browsing feels responsive.
4. As a visitor, I want Profile navigation to retain the current screen while fresh route content resolves, so that I do not repeatedly see a route-wide loading screen.
5. As a visitor, I want to see the same public Profile identity, biography, links, statistics, activity, favorites, library, reviews, and connections as before, so that the refactor does not change what a Profile means.
6. As a visitor, I want a missing Profile to show the existing not-found experience, so that absence is distinct from a temporary failure.
7. As a visitor, I want an unexpected Profile failure to show a clear recovery action, so that I can retry instead of seeing an unhelpful generic error.
8. As a signed-in user, I want the correct Follow state when viewing another Profile, so that I can immediately see whether I Follow them or they Follow me.
9. As a signed-in user, I want to Follow or unfollow a Profile with clear success and failure feedback, so that my relationship changes are trustworthy.
10. As a signed-in user, I want Profile counts and relevant Profile content to refresh after a Follow change, so that the screen reflects the action.
11. As a signed-out visitor, I want a Follow attempt to take me to sign-in, so that authentication remains required for Follow actions.
12. As a Profile owner, I want to edit my biography, banner image, and social links with validation feedback, so that my public Profile is accurate.
13. As a Profile owner, I want save failures explained concisely and successful edits reflected promptly, so that editing is predictable.
14. As a visitor, I want to switch Anime and Manga content in Profile sections using the existing URL state, so that the selected content is shareable and navigation behavior is preserved.
15. As a visitor, I want to paginate followers and following while keeping the page query in the URL, so that connection lists remain navigable and shareable.
16. As a Friends user, I want Follow controls to retain their current behavior after Profile is refactored, so that a Profile-focused cleanup does not regress the Friends area.
17. As a visitor, I want Profile UI to remain visually familiar while using fewer unnecessary wrappers and overrides, so that the interface is simpler without a redesign.
18. As a maintainer, I want Profile code to follow the same feature conventions as the rest of the web application, so that future changes have an obvious home.
19. As a maintainer, I want meaningful client orchestration separated from presentational components, so that UI code stays focused and reusable.
20. As a maintainer, I want public Profile caching kept separate from viewer-specific Follow state, so that cached Profile content never leaks one viewer's relationship to another.

## Implementation Decisions

- The Profile feature's target module inventory is: `actions.ts` for Profile save operations; `data.ts` for cached server reads and data-boundary errors; `schemas.ts` for Profile input validation and mapping; `utils.ts` for pure helpers; `layouts/profile-layout.tsx` for the shared shell and metadata; route views for overview, favorites, library, reviews, and connections; hooks for tabs, media URL state, Follow mutation, Profile-update mutation, and connection pagination; and components for edit Profile, tabs, media switcher, media card, Profile Follow presentation, connection pagination, and spoiler reveal.
- The shared Social feature owns Follow/unfollow server operations. It does not own Profile presentation.
- Preserve all existing public Profile routes, Profile behavior, permissions, empty states, and user-facing intent. Focused corrections are allowed only for instant navigation and coherent failure handling.
- Route entry points own raw parameter and query parsing, validate and canonicalize Username and connection page values, then pass business values into the feature. Feature views do not accept router parameter objects.
- Keep the Profile shell in the feature's layouts area. Keep route-specific content in views, reusable or useful client-bound UI in components, meaningful client orchestration in hooks, cached server reads in the feature data module, server mutations in actions, input validation and mapping in schemas, and pure helpers in utils.
- Extract a component only when multiple views use it or it creates a useful client boundary. Keep one-view sections such as Profile header composition, statistics, social links, activity composition, review rows, library grouping, and connection list rendering local to their owning view.
- Treat the current Profile files, component names, props, and boundaries as replaceable implementation detail. Rewrite or remove them when a smaller, clearer structure is better; do not preserve a split merely because it already exists.
- Keep Favorites, Library, and Reviews as explicit views. Share only genuine building blocks such as the media switcher and media card; do not create one broad mode-driven media view.
- Put TanStack Query and mutation orchestration, session/router work, and URL-state behavior in hooks. Keep tiny presentational state local to a component when extracting a hook would add indirection without reuse.
- Remove Profile's instant-navigation opt-outs. Do not add a route loading screen. Cached public Profile content should form the responsive shared experience, and only runtime viewer-specific work should use a focused Suspense boundary.
- Treat instant navigation as an acceptance condition: remove every Profile route segment opt-out, resolve any Profile-specific Next instant-navigation validation insight, and manually verify navigation across every Profile route, including Followers/Following pagination, without introducing tests.
- Retain the existing minutes-based public cache lifetime and tag invalidation policy while simplifying duplicated reads. Keep public cached Profile data separate from viewer-specific Follow state.
- Supply the Profile Follow control's initial relationship through an authenticated server-side read rather than a separate client relationship query. Follow-up changes use a shared Social server action and client mutation hook.
- Move shared Follow/unfollow behavior to Social because both Profile and Friends use it. Keep Profile-specific Follow presentation in Profile.
- Normalize Profile API/data failures at the server-data boundary: a missing Profile maps to not-found, unexpected render failures reach one Profile route error boundary with retry, and expected mutation failures return one compact result shape for the UI to toast. Unexpected mutation failures may still throw.
- Simplify the edit Profile form while preserving the existing fields and validation semantics. Keep the Profile API contract stable while aligning web/API/DB handling of nullable Profile fields and social links where that can be done without a behavior change.
- Remove obsolete profile-specific state/query-key and validation helper splits when their responsibility moves to the standard modules above.
- Prefer the shortest clear expression: use concise guard clauses and null rendering where they remain readable, rather than expanding routine control flow without benefit.
- Prefer shadcn components and their default behavior. Add or alter shared variants only when the result is broadly correct and materially removes repeated styling. Remove redundant Tailwind classes, default-behavior classes, HTML wrappers, and props; use inline prop types where a component has few props.
- Follow the accepted web decision "Profile feature composition" for these boundaries and navigation constraints.

## Testing Decisions

- Do not add tests for this refactor.
- Delete the two existing tests owned directly by the Profile feature. Retain tests owned by other features or API modules, including tests that incidentally exercise Profile-related behavior.
- No new test seam is proposed: the explicit no-test requirement overrides adding or preserving Profile-specific seams. Verification will be limited to non-test checks appropriate to the changed code and runtime behavior.

## Out of Scope

- Redesigning the public Profile experience, changing public URLs, changing Username reservation rules, or changing Profile permissions.
- Altering the product meaning of Profile, Username, Display Username, Follow, or Friends.
- Adding Profile tests, broad test-suite cleanup, or deleting non-Profile-owned tests.
- Adding a Profile route loading screen or custom manual prefetch system.
- Changing unrelated application routes, unrelated shadcn behavior, or Friends UI beyond the necessary migration to shared Follow behavior.

## Further Notes

- The refactor follows the repository's feature-based page → feature → view → component approach, with the layout exception recorded above.
- The cleanup is intentionally iterative: after each structural simplification, inspect for another removable wrapper, prop, utility, class, branch, or extraction until the result is clean, simple, and readable.
- The existing product glossary remains authoritative: use Profile, Username, Display Username, Follow, and Friends with their defined meanings.
