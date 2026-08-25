# Context Map

Tsuki's domain documentation is organized by repository context.

For the structural overview — which package owns which domain, and how the
domains map across packages — see `docs/domains.md`.

## Shared product domain

- Scope: product-wide language and social behavior
- Documentation: `CONTEXT.md`
- System-wide decisions: `docs/adr/`

## Web application

- Scope: `apps/web/`
- Documentation: `apps/web/CONTEXT.md` when present
- Decisions: `apps/web/docs/adr/` when present

## API application

- Scope: `apps/api/`
- Documentation: `apps/api/CONTEXT.md` when present
- Decisions: `apps/api/docs/adr/` when present

## Shared packages

- Scope: `packages/*/`
- Documentation: `<package>/CONTEXT.md` when present
- Decisions: `<package>/docs/adr/` when present
