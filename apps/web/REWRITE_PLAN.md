# Tsuki Web App Rewrite Plan

## Goal

Rewrite `apps/web` into a small, feature-oriented Next.js 16 application that is easier to read and change without weakening runtime correctness, security, accessibility, or Cache Components behavior.

The rewrite preserves Tsuki's current product surface:

- Discover trending anime and manga.
- Search AniList with media type and adult-content controls.
- View anime and manga details.
- Sign up, sign in, and sign out.
- Log progress, score titles, favorite titles, and write reviews.
- View and edit profiles, libraries, favorites, and reviews.
- Administer users, roles, bans, and impersonation.

## Audit Summary

The current code has a useful starting split under `src/modules`, but ownership is incomplete and several production issues are hidden by a passing typecheck.

### Baseline

- `bun run typecheck` passes.
- `bun run lint` fails with four errors and four warnings.
- `bun run build` exposes server-only code in a client dependency graph through `admin/lib/admin.ts`.
- The build also needs network access for `next/font` in the current environment.

### Architecture Findings

- App Router files contain profile filtering, empty states, data access, authorization, and admin fetching instead of only route wiring.
- Cross-feature UI lives in a generic `components` folder while the navigation feature is split across `components`, `hooks`, and `lib`.
- `modules` contains components, actions, queries, config, hooks, and route-level composition without a consistent naming or placement rule.
- Server-only helpers are not guarded by `server-only`, allowing an accidental client import to fail only at production build time.
- A combined admin authorization module exports both a browser-safe role predicate and a server-only redirect helper. Importing the predicate pulls `next/headers` into the client graph.
- Generated shadcn primitives and authored application components share the same conceptual layer.
- Large client files (`media-actions`, `admin-users-table`, `navbar`, and `edit-profile-dialog`) mix data access, state, mutation orchestration, and rendering.

### Runtime And Data Findings

- Public query helpers return errors as values from cached scopes. Those failures can be cached, including the home page's day-long trending cache.
- Profile queries use `cacheLife("max")`, which is too stale for public user activity even with mutation tags because data may also change outside this browser session.
- Profile updates invalidate a username supplied by the client instead of deriving the affected user from the authenticated session.
- The media synopsis renders upstream HTML with `dangerouslySetInnerHTML`; that is an unnecessary cross-site scripting boundary.
- The client media activity query discards API errors and silently treats failures as an empty activity record.
- Server Actions authenticate, but their exported arguments are not validated at the action boundary.
- Route-level auth checks are duplicated in the admin layout and both admin pages.
- Profile overview data is requested by both the profile layout and overview page. Cache Components prevents repeated remote work across requests, but explicit per-request ownership is clearer and does not depend on a long-lived public cache.

### UI And Accessibility Findings

- Icon-only and stateful controls are missing accessible names in several feature components.
- The spoiler reveal uses a clickable `span`, so it is not keyboard operable.
- Search and mobile navigation have transient state that can remain mounted under Cache Components' React Activity behavior.
- The navbar closes its mobile menu through a synchronous state update in an effect, which React's lint rules reject.
- Global loading uses Framer Motion for a three-dot indicator; CSS is sufficient and removes a runtime dependency.
- Several remote or user-configurable images do not match the configured Next image allowlist.
- `not-found.tsx` depends on a third-party animated GIF and uses an unoptimized `<img>`.
- Styling repeatedly uses oversized radii, gradients, and one-off utility strings instead of a restrained set of feature patterns.

### Repository Hygiene Findings

- Default Next starter SVGs are unused.
- `Backlight` is unused.
- There are no web regression tests or test script.
- Import ordering is inconsistent with the repository's four-group rule.
- Comments often narrate obvious code, while important server/client and caching constraints are not encoded in module boundaries.

## Target Structure

```text
apps/web/src/
  app/                         # Next.js route and metadata adapters only
  components/ui/               # shadcn-managed primitives
  features/
    admin/
      components/
      pages/
      data.ts                  # server-only reads
      permissions.ts           # browser-safe role rules
      query-keys.ts
    auth/
      components/
      pages/
      schemas.ts
    discover/
      components/
      pages/
    media/
      components/
      pages/
      actions.ts
      data.ts
      media.ts                 # pure media helpers/configuration
      schemas.ts
      query-keys.ts
    navigation/
      components/
      hooks/
    profile/
      components/
      pages/
      actions.ts
      data.ts
      schemas.ts
  shared/
    components/                # app-wide authored UI and providers
    hooks/                     # genuinely cross-feature hooks
    lib/
      api-client.ts
      query-client.ts
      server-api.ts
      session.ts
  lib/utils.ts                 # shadcn's required `cn` location
```

`components/ui` remains a generated boundary. It is reviewed and may receive focused fixes, but feature behavior must not be added there. `lib/utils.ts` remains because `components.json` and shadcn generation depend on it.

## Conventions

### Ownership

- A feature owns its route-level page components, domain UI, validation, data access, query keys, and mutations.
- `shared` contains code used by at least two features and no domain rules.
- Features may import from `shared`, `components/ui`, and monorepo packages.
- A feature may import another feature's public component or pure helper when the product relationship is real. Do not add barrel files to disguise dependencies.
- `app` imports feature pages. Features never import from `app`.

### Files And Symbols

- File and folder names use `kebab-case`.
- React components and their prop types use `PascalCase`.
- Hooks start with `use`.
- Server reads live in `data.ts`; exported Server Actions live in `actions.ts`; Zod schemas live in `schemas.ts`; TanStack keys live in `query-keys.ts`.
- Route-level feature components end in `Page` or `Layout`.
- No generic `helpers.ts`, `common.ts`, barrel `index.ts`, or one-use wrapper abstractions.

### Imports

Use exactly four groups separated by one blank line:

1. External libraries and framework imports.
2. `@tsuki/*` monorepo packages.
3. `@/*` path aliases.
4. Relative imports.

Import directly from the owning file. Do not add feature barrel exports.

### Server And Client Boundaries

- Components are Server Components unless interaction or a browser API requires `"use client"`.
- Add `import "server-only"` to session, authenticated server API, and server data modules.
- Never mix browser-safe predicates with server-only imports in one module.
- Pass the smallest serializable DTO into Client Components.
- Server Actions are public mutation endpoints: validate arguments and re-check authentication inside every action.

### Cache Components

- Uncached request data such as `headers()` stays behind a `Suspense` boundary.
- Public remote reads use `"use cache: remote"` close to the data access, with an explicit `cacheLife` and `cacheTag`.
- Media details may use a long lifetime because the API is a read-through media cache.
- Trending and profile activity use bounded lifetimes because they change over time.
- A cacheable function returns data or an intentional `null` for not found. It throws transient and unexpected failures so failures are never cached as data.
- Mutations call `updateTag` for the exact affected resource and aggregate views.
- Do not access `cookies`, `headers`, or `searchParams` inside a cached scope. Read them outside and pass only required values.
- React `cache` is used only for request-local deduplication, primarily session reads.

### Errors And Validation

- Invalid route params and confirmed 404 responses call `notFound()`.
- Transport and unexpected API failures throw to the nearest route error boundary.
- Client query functions throw API errors instead of manufacturing empty success results.
- User-controlled input is validated with Zod at the closest trust boundary.
- Upstream rich text is rendered as safe text unless a vetted sanitizer is deliberately introduced.
- Errors shown to users are actionable and do not leak server details.

### UI

- Keep the existing visual identity, but use consistent radii, spacing, typography, and state treatment.
- Use `next/image` for known allowlisted media; use a deliberate unoptimized image path for arbitrary user-provided URLs.
- Every icon-only control has an accessible name and tooltip when its purpose is not obvious.
- Interactive behavior uses semantic controls, including a button for spoiler reveal.
- Loading UI is local to the content that is waiting. Prefer skeletons or CSS over JavaScript animation.
- Transient menus and dialogs explicitly reset when navigation hides their route under React Activity.

### Tests And Gates

- Add focused Bun tests for pure domain transformations and validation boundaries.
- Every phase must pass `bun run typecheck` and `bun run lint`.
- Final acceptance requires formatting, tests, typecheck, lint, and `next build`.
- The production build is the authoritative server/client boundary check.

## Migration Order

### 1. Foundation

- Create shared providers, state UI, API clients, session access, and hooks.
- Mark server-only modules.
- Split browser-safe admin permissions from server authorization.
- Replace the animated global loader and remove unused starter assets/components.

### 2. App Router And Navigation

- Move route-level composition into feature `pages`.
- Reduce every `app/**/page.tsx` and nested layout to imports, framework props, and delegation.
- Rewrite navigation as a feature with small desktop, mobile, auth, and search components.
- Account for React Activity when closing transient UI.

### 3. Auth And Discover

- Share auth form structure without hiding field definitions behind a configuration framework.
- Keep login and signup schemas next to the feature.
- Rewrite discover state and search rendering into focused components.
- Throw client search errors and retain previous results while a new query loads.

### 4. Media

- Consolidate media configuration and pure transformations.
- Make cached reads return media/null and throw unexpected failures.
- Split activity querying, log form, rating, review, and favorite controls.
- Validate Server Action input and invalidate affected profile tags.
- Render synopsis safely and add dynamic metadata for detail pages.

### 5. Profile

- Move every profile route implementation into the feature.
- Use consistent media-type filtering and empty states.
- Derive mutation ownership from the authenticated session.
- Split edit-profile form transformations from dialog rendering.
- Add route metadata and bounded tagged caching.

### 6. Admin

- Authorize once in the admin layout and inside mutation APIs.
- Move dashboard fetching into server-only data access.
- Split user columns, query state, and action menu from the table controller.
- Keep URL-backed pagination and search behavior.

### 7. Cleanup And Verification

- Delete the old `modules`, generic authored component locations, unused hooks, and unused assets after all imports move.
- Normalize imports and naming.
- Add tests for media form normalization, safe synopsis text, route IDs, profile form payloads, and role rules.
- Run all acceptance gates and inspect the final dependency graph and diff for old paths.

## Definition Of Done

- All current routes and workflows remain available.
- App Router files contain no feature rendering, filtering, API calls, form logic, or reusable domain code.
- All authored application code follows the feature ownership and import conventions above.
- Cached functions never cache transient failures as successful values.
- Server-only code cannot enter a client bundle.
- Server Actions authenticate and validate their inputs.
- The media synopsis has no unsafe HTML injection.
- Lint, typecheck, tests, formatting, and production build pass.
- No old `src/modules`, unused authored components/hooks, or starter public assets remain.
