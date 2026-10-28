# Tsuki task specs

## Instructions for a future agent

When asked to `go specs.md`, read this file and the repository's applicable agent instructions. Work through the tasks in order, using one subagent at a time with the model named in the task. Give each subagent the task, relevant prior decisions, and the requirement to inspect the current code and follow repository conventions. Integrate and review its work before starting the next task; later tasks may depend on earlier changes. If an assigned model is unavailable, explain that and use the closest available model.

Each task is exactly one commit, using its specified lowercase conventional commit message. Check the working tree first, preserve unrelated changes, and commit only the files belonging to the task. Do not commit an incomplete or unverified task. Run appropriate checks for each change and have the subagent report what it changed, its checks, and any limitations. After completing each task, replace its **Comments** field with very concise, easy-to-scan bullet points covering the outcome, verification performed, and any limitations, and include that update in the task's commit. For tasks marked **Browser verification: Yes**, run a browser verification loop, using agent-browser or an available equivalent: exercise the stated flows, inspect the result, fix problems, and recheck. For mobile keyboard or touch behavior that cannot be faithfully reproduced, say what was and was not verified; do not claim physical-device verification without it. Respect reduced motion, accessibility, and existing desktop behavior throughout.

If requirements prove impossible or a dependency is unavailable, report the specific blocker instead of claiming completion. Read the relevant locally installed Next.js documentation before changing Next.js code, and honor nested AGENTS.md instructions.

## 1. Mobile navigation and discover switcher

- **Model:** 6.1 sol
- **Browser verification:** Yes — narrow mobile and desktop widths, signed-in and signed-out navigation, route changes, and reduced motion.
- **Commit:** `feat: add mobile dropdown navigation`

Replace the mobile horizontal navigation with a compact dropdown-like control showing the current route. Its collapsed appearance should look like the existing main rounded tabs component with just one tab, maintaining consistency with the navbar. Open a vertical dropdown of the existing tab-style route options. Animate opening, closing, and selection smoothly; support keyboard navigation, focus management, outside dismissal, and reduced motion. Keep route highlighting, available links, and desktop navigation behavior correct. Move the home page's anime/manga switcher to the top center on mobile as well as desktop, avoiding collisions with navigation, theme, and sign-in controls at narrow widths. Preserve its existing selection behavior.

**Comments:**

- Added accessible mobile route dropdown; centered mobile discover switcher above content; desktop tabs retained.
- Passed web typecheck, navbar lint, and Chrome checks at 320/375/768/1280px: routes, keyboard/focus, outside dismissal, media selection, reduced motion.
- Auth states used mocked sessions; no physical-device verification.

---

## 2. Reveal media quick actions on touch

- **Model:** 6.1 terra
- **Browser verification:** Yes — touch-sized viewport, desktop hover and keyboard focus, signed-in and signed-out states, and network requests.
- **Commit:** `feat: reveal media quick actions on touch`

On touch/no-hover devices, place a small, discoverable reveal button next to the card title, leaving a little gap and giving the title most of the available space. It reveals and hides the card's quick actions with the existing expansion style; a second tap or tapping outside dismisses them. Tapping the poster still opens media details. Do not fetch activity for every card merely because the grid mounted. Preserve desktop hover/focus behavior, action functionality, authentication prompts, and keyboard accessibility. Prevent reveal interactions from accidentally navigating or activating an underlying control.

`MediaCard` currently mounts actions for every no-hover card, and `useMediaActivity` requests activity per mounted card when authenticated. TanStack Query already caches this data with a default 60-second stale time. Reuse and assess that cache rather than adding a parallel cache; ensure repeated reveals benefit from appropriate freshness, mutations update or invalidate the right data, and activity cannot leak between accounts after sign-out or account changes. Verify requests are deferred until interaction and state remains correct after actions and session changes.

**Comments:**

- Added touch reveal and account-scoped activity cache; old account queries are cancelled and removed.
- Passed typecheck, oxlint, and Chrome checks for deferred/repeated requests, mocked mutations and account changes, auth prompt, poster navigation, hover and focus.
- Sessions, activity and mutation transport were mocked; real authenticated mutations and physical touch were not verified.

---

## 3. Instant navigation audit

- **Model:** 6.1 sol
- **Browser verification:** Yes — inspect initial navigation shells and representative links, including dynamic, authenticated, and media routes; use Next.js navigation tooling where available.
- **Commit:** `perf: improve instant navigation across routes`

Audit all application routes and their actual navigation entry points against the installed Next.js instant navigation guidance. Cache Components and Partial Prefetching are already enabled; determine what still blocks an immediately rendered, meaningful destination shell and address it with suitable Suspense boundaries, loading states, caching, and selective prefetching. An instant shell can stream dynamic content afterward; it does not imply all data is immediately available or that a cold cache never waits. Preserve authorization and avoid sharing private user data through public caches. Account for the custom media modal navigation and links that currently disable prefetching without creating excessive requests for large grids.

Use the installed Next.js validation tools and relevant automated checks, including meaningful regression coverage where practical. Report the route audit, validation, and any unavoidable exceptions in the task completion report. Do not weaken auth checks or change freshness requirements merely to pass validation.

**Comments:**

- Audited all routes; added Discover/admin shells and restored navbar shell prefetch; retained bounded media modal behavior.
- Passed production build, typecheck, oxlint, Next validation and Chrome shell/navigation checks; added instant() regression tests.
- See `docs/agents/instant-navigation-audit.md`; authenticated admin/private-profile browser access unavailable.

---

## 4. Stop the social feed switcher flashing

- **Model:** 6 luna
- **Browser verification:** Yes — direct load and client navigation while signed in and signed out, including a slow session response and `feed=following`.
- **Commit:** `fix: prevent social feed switcher flashing`

The current social page renders `SocialView` as signed out in its Suspense fallback and then replaces it with the session-dependent view. Remove the resulting appearance or layout flash of the public/following switcher while preserving an immediate useful shell, correct signed-out public feed, signed-in selection, URL state, and access control. Reserve stable space or use another visually appropriate pending treatment; do not render an incorrect signed-in state as a shortcut. Check that switching feeds and authentication changes remain correct.

**Comments:**

- Replaced the false signed-out fallback with a neutral feed shell; preserved header space and client session/feed updates.
- Passed web typecheck, oxlint, and all 5 navigation browser checks, including 320px layout, delayed session, feed URL and auth changes.
- Session and feed API responses were mocked in browser checks; no real authenticated account was used.

---

## 5. Close button for media details

- **Model:** 6 luna
- **Browser verification:** Yes — open and close media details on mobile and desktop, including keyboard and browser history behavior.
- **Commit:** `feat: add media details close button`

Add a clearly visible, circular icon-only close or back button to the media details modal, styled consistently with the minimized search button. It must remain reachable while viewing details, have an accessible name and focus indicator, and use the existing modal close/history flow so the background and focus restore correctly. Avoid obscuring content or conflicting with modal animations and mobile safe areas.

**Comments:**

- Added a sticky circular close button with safe-area spacing, using the existing history and focus-return flow.
- Passed typecheck, oxlint, formatting, and mobile/desktop browser checks for scrolling, close, Escape, Back, and focus restoration.
- Standalone ESLint could not start because typescript-eslint does not support the installed TypeScript 7.0 API.

---

## 6. Shared mobile bottom sheets

- **Model:** 6.1 terra
- **Browser verification:** Yes — exercise representative short, long, nested, and form dialogs on mobile and desktop, including drag dismissal, scrolling, focus, and reduced motion.
- **Commit:** `feat: add mobile bottom sheets for dialogs`

Implement mobile bottom-sheet behavior at the shared dialog source so dialogs receive it by default, while desktop retains the current dialog presentation. Include a clear drag affordance and natural animated downward drag to dismiss, with sensible thresholds and cancellation. Preserve dialog focus trapping, Escape and backdrop behavior, scroll locking, controlled close handlers, nested dialogs, and accessibility. Avoid accidental dismissal during content scrolling, text selection, or interactions with form controls; make long content scrollable and respect safe areas and reduced motion.

Provide an explicit per-dialog opt-out for cases that do not suit a sheet, and assess existing dialog consumers including auth verification, crop, rich-content, and discard confirmation. Keep the media details modal in its current full-screen-style layout on mobile, using the opt-out as appropriate, and preserve its custom morphing, history, and return focus. Honor existing busy or guarded close handlers.

**Comments:**

- Added default mobile sheets with handle dragging and controlled dismissal; media details opts out.
- Passed typecheck, oxlint, mobile/desktop Chrome fixture checks, auth and media close checks; see consumer assessment.
- Fixture covers nested, long and guarded dialogs; no physical touch or software keyboard verification.

---

## 7. Mobile search placement, expansion, and keyboard

- **Model:** 6.1 terra
- **Browser verification:** Yes — home and social on narrow and wider screens, expanded/collapsed states, long text, safe areas, keyboard open/close, and reduced motion. Verify on a real mobile device if available and report any limitation.
- **Commit:** `fix: improve mobile search interaction`

Place the collapsed mobile search control at the bottom right on both home and social. Animate it smoothly from the circular icon to an input spanning the available width with appropriate edge and safe-area spacing. Fix clipped text in the social search. Preserve the existing search state, clear/close behavior, focus, accessibility, and desktop layout.

When the mobile software keyboard appears, keep the input visibly above it as the viewport changes, including during typing, rotation, and keyboard dismissal. Account for the existing bottom soft blur so it remains visually coherent and does not obscure the input or content; adapt or remove it when appropriate. Use feature detection and graceful fallbacks for differing browser viewport behavior, avoid layout jumps, and do not claim emulator-only checks prove native keyboard behavior.

**Comments:**

- Moved mobile search to the bottom right; expanded width respects safe areas and follows the visual viewport.
- Passed typecheck, oxlint, and Chrome checks on home and social at 320/430/1024px, including long text, close, reduced motion and simulated viewport changes.
- No physical device or native software keyboard was available; viewport behavior was simulated.

---

## 8. Improve dialog backdrop separation

- **Model:** 6.1 sol
- **Browser verification:** Yes — representative dialogs and media details, light and dark themes, mobile and desktop, reduced motion, and a browser without backdrop-filter support if available.
- **Commit:** `style: improve dialog backdrop separation`

Improve the shared dialog backdrop so open dialogs are clearly separated from the page, using a restrained blur and/or dimming that fits Tsuki's existing soft-blur visual language. Preserve readability, performance, backdrop dismissal, stacking of nested dialogs, and a usable fallback where blur is unsupported. Review the media modal's explicit backdrop overrides and make its result coherent without breaking its custom transition. Check that the new appearance works with the mobile sheets introduced above.

**Comments:**

- Added restrained 4px shared backdrop blur and theme-aware dimming; media inherits it while retaining its morph transition.
- Passed typecheck, root oxlint, all 5 navigation tests, and Chrome light/dark mobile/desktop checks for auth, nesting, dismissal, media close and reduced motion.
- No-blur fallback was simulated by removing the filter enhancement; no unsupported browser or physical device was available. Nested dialogs retain Base UI's shared backdrop and Escape behavior.
