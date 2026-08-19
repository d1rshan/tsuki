# Tsuki Refactoring Approach

Use this workflow when rewriting a feature for clarity rather than preserving its current file structure.

## Understand before editing

1. Read every file in the feature and trace its routes, callers, shared dependencies, state, data fetching, loading states, and error states.
2. Preserve behavior deliberately; do not preserve an abstraction merely because it already exists.
3. Identify which code is feature-specific and which behavior belongs to a shared primitive or hook.

## Rewrite from the outside in

1. Keep framework concerns such as metadata and Suspense boundaries at the route entry.
2. Make the view own the feature data and readable page composition. Remove lightweight pass-through components that only rename props or return one child.
3. Split components by meaningful page mode or responsibility, not by arbitrary chunks of markup.
4. Name files and components after what they render, using feature context when a generic name would be misleading.

## Prefer simple composition

- Use `title`, optional `actions`, and `children` for repeated titled sections.
- Keep invariant markup inside the reusable component; let callers compose only the changing content.
- Avoid compound-component APIs when a small prop-and-children API fully describes the variation.
- Avoid boolean customization props when explicit composition or one consistent presentation is clearer.

## Keep state close to its consumer

- Let each page mode own the URL state, hooks, and actions it actually uses.
- Pass data into presentational components; do not thread setters through multiple layers.
- Add context only when several distant siblings genuinely share state.
- Make hooks expose domain states such as `isPending`, not implementation details such as separate fetch and debounce flags.
- Normalize input once at the boundary where its meaning changes, such as trimming a search query before choosing search mode.

## Minimize APIs and indirection

- Inline a props type when it has one property and one use.
- Keep named props types when several fields form a meaningful public contract.
- Destructure hook results at the call site instead of repeatedly reading through a result object.
- Prefer a local render function with early returns for several UI states. Avoid nested ternaries, `switch (true)`, and a component that exists only to hold the branches.
- Do not extract a constant, helper, component, or file unless the name removes real ambiguity or the code has more than one meaningful consumer.
- Avoid duplicating responsibility, such as slicing a list in both a parent and its carousel.

## Keep markup and styling intentional

- Remove wrapper elements that provide neither semantics nor necessary layout.
- Prefer semantic elements such as `section`, `header`, and `article` when they describe the content.
- Remove Tailwind classes already supplied by the shared component or its variant.
- Move truly universal component appearance and positioning into the shared primitive so every consumer stays consistent.
- Keep feature-specific geometry, content styling, and special presentation local. For example, ranked media numbers belong to discover, not the base carousel.
- Use existing design-system components and semantic color tokens before adding custom markup or styles.

## Review every boundary

For each component, ask:

- Does this component own real behavior or composition?
- Can its props be reduced by moving state to the actual consumer?
- Is a one-property type alias adding anything?
- Is this wrapper, class, constant, or variable earning its place?
- Is this styling a shared default or a feature-specific exception?
- Does the name describe the rendered responsibility precisely?

Finish with formatting, focused linting, type checking, tests, dead-reference searches, and `git diff --check`. Report unrelated pre-existing failures separately.
