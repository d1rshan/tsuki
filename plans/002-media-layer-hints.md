# 002 — Remove persistent media layer hints

- **Status**: DONE
- **Commit**: dfe9771
- **Severity**: LOW
- **Category**: Performance
- **Estimated scope**: 4 components

## Problem

`apps/web/src/features/media/components/media-card.tsx:81`, `media-header.tsx:67`, and `media-modal.tsx:50` contain permanent hints such as:

```tsx
willChange: "transform",
transform: "translateZ(0)",
backfaceVisibility: "hidden",
```

The card applies these to surface/poster/title across the entire idle grid. `media-layout-group.tsx:34` also permanently requests opacity promotion.

## Target

Remove manual `willChange`, `translateZ(0)`, and backface hints from these media wrappers, letting Motion manage active animations. Retain numeric inline border radius (12/8 card, 24 modal, 12 header) for projection correction. No replacement permanent layer hints, blur or dependencies.

## Repo conventions to follow

Preserve `layoutId`, `layout="position"`, `layoutRoot`, `layoutScroll`, reduced-motion logic and Tailwind isolation classes. Follow external → monorepo → @/ → relative import groups.

## Steps

1. Remove the three hints from surface/poster/title styles in `apps/web/src/features/media/components/media-card.tsx` and `media-header.tsx`; remove empty style objects.
2. Remove them from `media-modal.tsx` surface and remove opacity willChange from overlay.
3. Remove opacity willChange from `media-layout-group.tsx` reveal.

## Boundaries

Only these media animation wrappers. Preserve radii, imagery, shared IDs, routing, dialog accessibility. Apply after plan 001. Report unexpected source drift rather than improvising.

## Verification

- **Mechanical**: `cd apps/web && bun run typecheck`; targeted ESLint. No permanent promotion hints remain in edited media wrappers.
- **Feel check**: repeat card open/close and interrupted transitions desktop/mobile at normal and 10% playback. Check rounded clipping and poster rendering. Inspect Layers/Performance with many idle cards: no explicit layer hints on each wrapper. Profile actual layer cost before claiming measured gains.
- **Done when**: hints removed and no visual regression found; document if browser checks unavailable.

## Execution result

Removed manual promotion hints from all four media components, retaining numeric radii and projection props. Browser open/close checks passed at desktop/mobile sizes and both motion preferences; screenshots reviewed for poster/rounded clipping. Typecheck, root oxlint and formatting passed. Actual GPU memory/frame-time gains were not profiled.
