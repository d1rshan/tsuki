basic project context: @AGENTS.md

so we are in a feature branch for redoing the profile page entirely,

so i dont like the ui/ux not even a bit for the profile page now, i want you to redo it completely, but first go through our profile page related stuff and then rewrite entirely, also i dont want to use skeletons for profile page, pls remove them!

since we are using next.js 16 with cache components enabled, you have to make sure the proper usage of Suspense too! ie the new PPR.

after redoing our profile routes ui/ux, i want you to use the request code review skill to review our code in this branch against the default branch `arc/dev`

and address the issues!

after that it will be the time to refactor/simplify everything!

- i like to keep the components modular - also we store components based on the route - so they will go in src/components/profile/*
- and i dont like using too many files, keep relevant stuff in the same file. and the code should be readable so we break down some functional components for nice separation.
- u can use the existing simplification refactor skill to help you with the process as well.
- and also u must use the pony tail skill to review all our changes in this branch pr and address them as well!.

# IMPORTANT RULES

- you must follow next.js best practices with cache components enabled, our site is production standard and make use of the next.js cache components skills, ie things like keeping most of the stuff on server side, caching with the new 'use cache' directive
- keep the ui/ux clean and minimal dont overdo it.
- make commits in between - only when it acts as a nice checkpoint (dont worry about commit msg convention - im gonna squash merge)
- when doing the refactor pass, it is not just technically refactoring ie just moving stuff around - it will involve simplification rewrite as well to do things more cleaner and simpler.
- make use of pony tail too!
- at last after everything use the requesting review skill to finish it off!

READ THIS ENTIRE FILE AND AT END OF THIS FILE ADD TODOS FOR YOUR GUIDANCE AND THEN START WORKING THIS LOOP!

## TODOs

- [x] Analyze the current profile page code (pages, components, and layout).
- [x] Redo the profile page UI/UX entirely, removing all skeletons.
- [x] Ensure proper use of Suspense/PPR with Next.js 16 cache components (using 'use cache').
- [x] Group related components logically in `src/components/profile/*`, prioritizing readability without creating too many files.
- [x] Make checkpoints (commits) during the process.
- [x] Run the `requesting-code-review` skill against the `arc/dev` branch and address all issues.
- [x] Run the `simplify` skill on the profile components to ensure clean code.
- [x] Run the `ponytail-review` skill to check for over-engineering and apply recommendations.
- [x] Run a final code review using the `requesting-code-review` skill to finish off.
