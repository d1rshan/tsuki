# Instant navigation audit

Audited with installed Next.js 16.4.3, Cache Components and Partial Prefetching enabled (task 3 in `specs.md`). “Instant” means a meaningful warm shell can render while request-time content streams; it does not promise completed data or a zero-wait cold cache.

## Routes and entry points

| Route                                                    | Actual entry points                                                                                                         | Initial UI and deferred work                                                                                                                                                                                                                        |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                                      | Navbar, logo, footer, admin exit, 404, UI preview; auth email callbacks                                                     | Added page-local Suspense with an accessible poster-grid placeholder. Cached trending and client URL/search state resolve inside it. The boundary works below the shared app layout. Existing public trending lifetime remains unchanged.           |
| `/social`                                                | Desktop navbar and mobile dropdown                                                                                          | Restored default App Shell prefetch instead of disabling it. Existing Activity/Recent reviews shell streams the session gate. Its signed-out fallback switcher issue is explicitly reserved for task 4.                                             |
| `/anime/[id]`, `/manga/[id]`                             | Discover grids, searches, libraries, favorites, Activity, reviews and related media via `MediaLink`; external/direct visits | Canonical pages already place params, JSON-LD and details under page-local `MediaPageSkeleton` Suspense. Public catalogue cache retains existing tags/lifetime. Metadata streams independently.                                                     |
| `/<username>`                                            | Navbar Profile, Social profile cards, Activity actors, review authors, Follow requests and profile tabs                     | Existing public identity/banner placeholder and tabs shell; username resolution and viewer overview remain behind local Suspense. Explicit profile link prefetch resolves public identity per username.                                             |
| `/<username>/anime-list`, `/manga-list`                  | Profile tabs                                                                                                                | Same shared header; each page has its own `ProfilePage` boundary below the shared layout. Viewer-authorized library and filter params stream.                                                                                                       |
| `/<username>/favorites`, `/reviews`, `/stats`, `/social` | Profile tabs and profile internal links                                                                                     | Same shared header and page-local boundary. Viewer-dependent sections and URL filters stream. No profile route loading files or profile-specific tests were added, in accordance with its ADR.                                                      |
| `/admin`                                                 | Admin entry from user menu, admin sidebar                                                                                   | Replaced anonymous full-screen spinner with “Administration / Checking access…” plus status spinner. The existing `requireAdmin()` gate still wraps every protected child; denied viewers redirect home. Overview's count retains its own Suspense. |
| `/admin/users`                                           | Admin sidebar                                                                                                               | Same access shell on entry; authenticated shared-layout navigation renders the Users page and client table pending state. Better Auth still authorizes data access.                                                                                 |
| `/ui`                                                    | Direct design preview, Home return link                                                                                     | Static preview, no server data blocker.                                                                                                                                                                                                             |
| Not-found / error / global-error                         | Invalid usernames/media and failed requests                                                                                 | Existing immediate recovery UI. Error retry retains existing semantics.                                                                                                                                                                             |

Non-page entry points were also inventoried: robots, manifest, icon and root Open Graph output are static; sitemap and profile/media Open Graph images are request-generated resource responses, not navigable destination UI. Auth/API rewrites proxy to Elysia; auth is dialog-based, with no auth page routes.

## Media modal and prefetch policy

`MediaLink` deliberately keeps `prefetch={false}`: normal in-app selection uses native history and `MediaNavigationProvider`, preserving the mounted background and opening the local modal immediately. Full media objects render details directly; compact objects render the existing details skeleton while TanStack Query fetches the public title. Canonical RSC prefetch would do redundant work for this path, particularly in large/infinite grids. Modified clicks and direct visits retain real canonical URLs and their server skeletons. History/back behavior is unchanged.

Navbar Discover and Social now use default shared App Shell prefetch; Profile keeps explicit per-link prefetch for its username-dependent public identity. Existing profile/social identity links and profile tabs retain their policy. Query-only filters are managed by nuqs; they update the current view rather than introducing another page shell. No new private/shared cache was introduced, and no cache lifetime was extended.

## Verification

- Read installed instant-navigation, adopting-partial-prefetching, prefetching, instant segment API and authentication-with-cache-components guides, plus profile/auth ADRs.
- Next MCP `get_compilation_issues`: `issues: []`. Visited every page pattern through Chrome against `next dev` to trigger default instant validation; MCP `get_errors` returned empty config/session errors. No instant opt-outs or validation suppression were added. Request Insights CLI reported it requires the optional `experimental.requestInsights` flag; configuration was left unchanged.
- Production build passed; pages are static or partially prerendered. Web TypeScript and changed-file oxlint passed. Existing web ESLint remains incompatible with installed TypeScript 7.
- Three regression tests passed against both development and production (17.0s and 2.8s respectively). Committed Playwright tests use installed-version `@next/playwright` `instant()` to hold dynamic work: assert Discover's meaningful fallback, admin's non-sensitive access shell followed by signed-out redirect, and client navigation to Social's destination content.
- Manual `instant()` browser checks inspected shells for every profile page, both canonical media pages, Social, Discover and both admin pages in development and production. Existing public profile `d1rshan` resolved on all seven pages; missing profile produced 404.
- Production Chrome network: Home/Social RSC prefetches, no per-title grid RSC prefetches. Media modal open and browser Back restored its background; public profile pages and Home → Social resolved without runtime errors.

Run the regression tests against a running development server:

```sh
CHROMIUM_PATH=/run/current-system/sw/bin/google-chrome bun run --cwd apps/web test:navigation --workers=1

# Production: build, then run the server in another terminal
bun run --cwd apps/web build
bun run --cwd apps/web start --port 3002
NAVIGATION_TEST_URL=http://localhost:3002 CHROMIUM_PATH=/run/current-system/sw/bin/google-chrome bun run --cwd apps/web test:navigation --workers=1
```

Install Playwright Chromium first (`bun run --cwd apps/web playwright install chromium`) or supply `CHROMIUM_PATH`. `NAVIGATION_TEST_URL` can target a running production server. Tests require a signed-out browser context and the local API; the config does not launch or replace servers.

## Limits

Actual administrator credentials and a private-profile relationship were unavailable. The real signed-out admin denial, public profile reads and catalogue reads were verified; authorized admin data and private follower access were assessed from the server gates and were not claimed as authenticated browser verification. Cold remote-cache misses and request-time session/access checks can still wait behind the documented shells. Social switcher pending-state appearance is task 4. No physical-device test was required or performed for this navigation audit.
