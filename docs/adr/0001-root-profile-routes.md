# Root profile routes

Tsuki Profiles use `/<username>` as their canonical public URL, so a profile
can be shared like a GitHub profile. The existing `/profile/<username>` route
will be removed rather than redirected because Tsuki has no users to migrate.
Usernames that conflict with an existing root application route are reserved;
the validation list must carry a comment requiring it to be updated whenever a
new root route is added. `/friends` is one such reserved root route.
