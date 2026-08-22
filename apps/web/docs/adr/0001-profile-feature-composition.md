# Profile feature composition

Profile is a web feature whose routes stay thin: `app/(app)/[username]` owns URL parsing and passes canonical values to the feature. The feature keeps its shared shell in `layouts/`, route content in `views/`, reusable or client-bound UI in `components/`, meaningful client orchestration in `hooks/`, server reads in `data.ts`, server mutations in `actions.ts`, validation in `schemas.ts`, and pure helpers in `utils.ts`. This preserves a small, feature-local surface while giving the same kinds of code a conventional home.

## Consequences

- A component is extracted only when it is reused across views or forms a useful client boundary; one-view sections stay local to that view. Tiny presentational state may remain local, but TanStack Query, mutations, session/router, and URL-state orchestration belong in hooks.
- Follow is owned by the shared social feature because Friends and Profile both use it. Profile-specific presentation remains in Profile.
- Public Profile reads remain cached and tag-invalidated. Viewer-specific Follow state is fetched separately behind Suspense, so it does not make the public cache viewer-dependent.
- Profile route segments must support instant navigation without `instant = false` or a route `loading.tsx`; cached content renders immediately and only runtime viewer work streams.
- Profile UI should use shadcn defaults where possible, avoid redundant Tailwind/default HTML wrappers, keep props minimal, and remove profile-specific tests without replacing them.
