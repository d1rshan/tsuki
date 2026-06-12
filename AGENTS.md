# RULES

* Write production-ready code that prioritizes maintainability, readability, correctness, and scalability.
* Follow established industry best practices, patterns, and conventions for the technologies being used.
* Use clear naming, consistent structure, and strong separation of concerns.
* Keep functions, components, and modules focused on a single responsibility.
* Avoid duplication, unnecessary complexity, premature optimization, and over-engineering.
* Design solutions with long-term maintainability in mind, not just immediate functionality.
* Prefer robust architectural decisions over quick fixes.
* Consider error handling, type safety, security, performance, and edge cases as part of the implementation.
* Do not implement naive solutions when established production patterns exist for the problem being solved.
* When selecting libraries, patterns, or approaches, evaluate tradeoffs and choose the most appropriate production-ready solution rather than the simplest implementation.
* Ensure generated code is cohesive with the existing codebase and follows its architecture and conventions.

# External APIs

## AniList

Documentation: <https://docs.anilist.co/>

Before implementing AniList-related functionality, ONLY IF YOU ARE NOT SURE:

* Consult the AniList documentation.
* Use the official GraphQL schema and documented API patterns.
* Do not assume field names, query structures, or response shapes.
* Prefer existing project abstractions over direct API calls.
* Keep AniList-specific logic isolated within the data-access layer.
