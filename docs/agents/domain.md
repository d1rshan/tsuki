# Domain Docs

## Before exploring

- Read `CONTEXT-MAP.md` at the repo root.
- Read each context-specific `CONTEXT.md` relevant to the topic.
- Read relevant system-wide ADRs under `docs/adr/`.
- In each context, also check its local `docs/adr/` directory.

If a relevant file does not exist, proceed silently.

## Layout

This repository uses a multi-context layout:

- `CONTEXT-MAP.md` maps repository areas to their context documentation.
- `docs/adr/` contains system-wide architectural decisions.
- Each context may contain its own `CONTEXT.md` and `docs/adr/`.

## Vocabulary

Use domain terms as defined by the relevant context's `CONTEXT.md`. Avoid introducing synonyms for established concepts.

## ADR conflicts

If output contradicts an existing ADR, surface the conflict explicitly rather than silently overriding it.
