Status: ready-for-agent

## Problem Statement

Tsuki currently has no footer in its user-facing application shell. The app
therefore lacks a consistent closing surface for its product identity, open
source repository, and AniList attribution. Users should be able to recognize
the product and reach the public project resources without adding duplicate
navigation that already exists in the navbar.

## Solution

Add a restrained, responsive Footer component to the user-facing application
shell. Render it after the main content so short pages still fill the viewport
and the footer remains at the bottom of the shell. The footer presents Tsuki's
identity and existing product description, a clearly labeled GitHub link to the
open-source repository, and a compact AniList attribution link.

The footer is part of the visible application UI only. It does not modify Next
metadata, API contracts, database schemas, or the navbar's navigation links.

## User Stories

1. As a Tsuki visitor, I want to see a consistent footer on user-facing pages,
   so that the application feels complete and professionally finished.
2. As a Tsuki visitor, I want the footer to identify Tsuki, so that I know
   which product I am using after reaching the end of a page.
3. As a Tsuki visitor, I want to see the description “Track, rate, and review
   anime and manga,” so that the purpose of Tsuki is immediately clear.
4. As an open-source visitor, I want a clearly labeled GitHub link, so that I
   can inspect, use, report issues for, or contribute to the project.
5. As a keyboard user, I want to reach every footer link through normal
   keyboard navigation, so that the footer does not require pointer input.
6. As a screen-reader user, I want the footer and its links to have meaningful
   semantic names, so that I can understand and navigate its contents.
7. As a Tsuki visitor, I want GitHub to be recognizable through both an icon
   and text, so that the destination is discoverable without relying on icon
   recognition alone.
8. As a Tsuki visitor, I want external links to clearly behave as external
   links, so that opening project or attribution resources does not feel like
   navigating to an internal Tsuki route.
9. As an AniList user, I want Tsuki to acknowledge AniList as its data source,
   so that the source of anime and manga information is transparent.
10. As a visitor, I want the AniList attribution to link to AniList, so that I
    can learn more about the source directly.
11. As a mobile visitor, I want the footer content to stack cleanly, so that
    links remain readable and tappable on narrow screens.
12. As a desktop visitor, I want the footer to use intentional spacing and
    hierarchy, so that it complements the application without competing with
    anime and manga content.
13. As a visitor using a theme, I want the footer to follow Tsuki's existing
    theme tokens, so that it remains legible in every supported theme.
14. As a visitor on a short page, I want the footer to sit at the bottom of
    the viewport, so that the page does not look unfinished.
15. As a visitor on a long page, I want the footer to follow the content
    naturally, so that it does not obscure or overlay page content.
16. As a user of the main application, I want the footer to appear once per
    page, so that it provides context without repetition.
17. As an admin user, I want admin screens to remain task-focused, so that the
    public application footer does not add unrelated visual noise to admin
    workflows.
18. As a maintainer, I want the footer to be a reusable application-shell
    component, so that its content and presentation have one clear owner.
19. As a maintainer, I want the footer to use existing external-link and icon
    conventions where appropriate, so that it behaves consistently with the
    rest of the web application.
20. As a maintainer, I want this feature to remain static and presentation-only,
    so that it does not introduce unnecessary client state, API work, or data
    dependencies.

## Implementation Decisions

- Add a reusable Footer component owned by the web application's shared UI
  layer and render it from the existing user-facing application layout after
  the main content.
- Preserve the existing full-height shell behavior: the main content remains
  flexible, and the footer participates in normal document flow rather than
  being fixed, sticky, or overlaid.
- Keep the footer out of the admin layout. It applies to the main user-facing
  application experience, including public and authenticated pages covered by
  that layout.
- Show Tsuki identity and the existing product description: “Track, rate, and
  review anime and manga.”
- Show a GitHub icon together with the text “GitHub,” linking to the project's
  public repository at `https://github.com/d1rshan/tsuki`.
- Show a compact AniList attribution link to `https://anilist.co` because
  Tsuki uses AniList as its anime and manga data source.
- Treat both repository and AniList destinations as external links. Open them
  in a new tab with the existing secure `noopener noreferrer` behavior, while
  retaining visible link text and accessible names.
- Do not add application navigation links to the footer. Home, Discover,
  Friends, Profile, authentication, and other product navigation remain owned
  by the navbar or their existing page-level controls.
- Use a restrained visual treatment consistent with the existing application:
  muted surface and text, subtle border, deliberate spacing, and clear type
  hierarchy. Avoid a large promotional or multi-column marketing footer.
- Use responsive layout rules that stack footer content on narrow screens and
  arrange it horizontally when the available width supports it. Keep targets
  comfortably tappable and avoid tiny text.
- Use existing theme variables and established UI primitives/utilities rather
  than introducing a new color system or component dependency.
- Use a semantic `footer` landmark and meaningful link content. Decorative
  icons must be hidden from assistive technology, and external-link behavior
  must not depend on hover-only visual cues.
- Do not change Next metadata, routes, API behavior, database schema, AniList
  client behavior, authentication, or navbar navigation.

## Testing Decisions

- Tests should verify externally observable behavior rather than Tailwind class
  names, component internals, or the exact implementation of the layout.
- Use the highest available seam: verify that the user-facing application shell
  renders one Footer after its main content and that the admin shell does not
  inherit it.
- Verify the footer's semantic landmark, visible Tsuki description, GitHub and
  AniList destinations, external-link security behavior, and accessible link
  names.
- Verify that the footer is static and renders without API, authentication, or
  browser-only state dependencies.
- Reuse the existing web test command and conventions. The repository currently
  has focused Bun tests for shared and feature behavior but no established
  browser-test suite, so integrated visual and responsive checks should be
  manual unless a suitable component-test seam already exists when the feature
  is implemented.
- Manual verification should cover a short public page, a long media or
  Profile page, an authenticated page, mobile-width layout, desktop-width
  layout, light/dark or supported theme variants, keyboard navigation, and an
  admin page.

## Out of Scope

- Duplicating navbar or page navigation links in the footer.
- Adding social-media links, newsletter signup, contact forms, donation flows,
  legal pages, privacy/terms links, or other destinations not agreed here.
- Adding a copyright/year line or changing application metadata.
- Adding a footer to admin screens.
- Adding API endpoints, database tables, configuration, or runtime data
  fetching for footer content.
- Changing the navbar, page routing, authentication, AniList integration, or
  existing external-link behavior outside what is needed to use it in the
  footer.
- Building a large marketing, sitemap, or multi-column footer.
- Adding automated browser or end-to-end testing solely for this static UI
  component.

## Further Notes

The existing user-facing application layout already provides the appropriate
single integration seam: it is a full-height flex shell with flexible main
content and a separate admin layout. The implementation should preserve that
boundary and keep the footer's ownership obvious.

The GitHub repository URL was confirmed from the current repository remote.
AniList attribution reflects the existing product architecture and the
`@tsuki/anilist` package used by the web application.
