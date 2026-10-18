# Coordinate the Better Auth 1.7.3+ database upgrade

Status: ready-for-human

PR #87 retains Better Auth 1.7.2 because 1.7.3+ stops writing `account.issuer`.
The current Drizzle schema and deployed database require that column. Updating
only the package makes authentication fail with `SCHEMA_MISMATCH`; merely
changing the TypeScript schema leaves live account inserts broken.

Follow https://www.better-auth.com/docs/guides/1-7-upgrade-guide:

1. Check duplicate `(provider_id, account_id)` pairs without combining users.
2. Prepare a reversible database change to relax `account.issuer` and remove
   `account_issuer_accountId_uidx`, preserving existing account data.
3. Coordinate the Drizzle declaration, database change, and Better Auth update.
4. Run the existing API endpoint tests, then verify new signup and existing
   email/password signin against a disposable database before deployment.

Do not run a production schema push just to make dependency CI green.
