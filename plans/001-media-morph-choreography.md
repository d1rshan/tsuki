# 001 — Coordinate the media morph

- **Status**: DONE
- **Commit**: dfe9771
- **Severity**: MEDIUM
- **Category**: Performance, easing & duration
- **Estimated scope**: 5 components plus one motion constants module

## Problem

`apps/web/src/features/media/components/media-card.tsx:123` currently animates footer height:

```tsx
animate={{ height: expanded ? "auto" : 36 }}
transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
```

The grid's remaining row holds the shared poster. Hover therefore changes its geometry on every frame and can overlap the modal morph. `media-layout-group.tsx:10` and `media-modal.tsx:48` independently specify `{ type: "spring", bounce: 0, duration: 0.18 }`. `media-header.tsx:100` gives metadata an exit fade without an entrance.

## Target

Preserve the original grid hover layout: the poster shrinks as the footer expands, retaining the poster's own 8px rounded bottom corners. Animate footer height from 36px to auto over 150ms with cubic-bezier(0.23, 1, 0.32, 1); reduced motion uses zero duration. The user explicitly rejected the overlay footer because its rounded top corners inverted the poster's visible bottom edge. This visual decision supersedes the original fixed-poster performance proposal. Keep quick actions accessible and lazy-mounted, with opacity feedback and inert collapsed content.

Add local constants in `apps/web/src/features/media/motion.ts`: shared zero-bounce spring duration 0.25s; UI ease `[0.23, 1, 0.32, 1]`; overlay opacity 0.2s; details opacity entrance 0.15s after 0.1s delay, exit 0.1s. Reuse these in the group, modal and detail reveal. Reuse `MediaDetailsReveal` for header metadata. Keep poster/title shared IDs and title position projection. Reduced motion disables translation/scale and shared IDs, retaining brief 0.15s opacity feedback without entrance delays. Direct full pages must render their details immediately.

## Repo conventions to follow

- Existing `MediaDetailsReveal` lives in `media-layout-group.tsx`; extend and reuse it.
- Import groups: external, monorepo, @/ aliases, relative, with blank lines.
- `cn` comes from `@/shared/lib/utils`.
- Read `apps/web/node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md` before code.

## Steps

1. Add typed local motion constants with the exact targets above.
2. Retain the original grid and footer height disclosure, using the shared 150ms timing and strong ease-out. Keep quick actions lazy-mounted after activation. Hidden actions must be unfocusable. Retain touch + button and Escape/outside dismissal.
3. Share the 250ms spring between layout group and modal surface; coordinate overlay and details fades using constants.
4. Replace metadata's exit-only wrapper with `MediaDetailsReveal`.
5. Ensure reduced motion has opacity-only feedback and no delayed reveal.

## Boundaries

- No dependencies, data fetching, routing/history, canonical media pages or shared dialog changes.
- Preserve dialog focus trap/return, close/Back/Forward behavior and shared element identity.
- No attempt to fix uncached search skeleton continuity; outside these findings.
- If source differs from the commit excerpts, report drift before improvising.

## Verification

- **Mechanical**: `cd apps/web && bun run typecheck`; targeted ESLint on edited files. Run existing media history tests. Expect no new failures.
- **Feel check**: open hovered and non-hovered cards, close via X/Escape/Back, reopen before exit completes; try desktop and 390px touch viewport. At 10% playback confirm surface/poster/title move together, the poster shrinks on hover and retains its own rounded bottom corners, and metadata enters after motion starts. Scroll modal then close to verify return target. Check action focus and touch + dismissal.
- Emulate reduced motion: no geometric morph or footer movement; content stays available and fades briefly.
- **Done when**: original hover geometry and rounded corners are preserved; all shared elements use one 250ms spring; metadata and secondary details share reveal timing; navigation and action behavior remain usable.

## Execution result

Implemented shared morph timing, metadata reveal, reduced-motion opacity feedback and layer-hint removal. The initial transform-only overlay changed the hover shape; user feedback required restoring the original grid/poster resizing behavior. Kept the unpadded inner title span to prevent clipped text fragments. Earlier browser checks covered desktop/touch, both motion preferences, X/Escape/Back/Forward, interrupted opening, sticky close, focus return and quick actions. Targeted ESLint cannot start because installed typescript-eslint rejects repository TypeScript 7. Manual 10% playback remains a human feel check.

Hover correction applied: original grid/footer height disclosure restored, including 8px poster bottom radii. Desktop normal/reduced-motion browser regression checks and screenshot review passed; typecheck, root oxlint and formatting passed.
