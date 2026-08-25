/**
 * Root application routes cannot be Usernames. Update this list whenever a
 * root application route is added, so every Profile URL remains unambiguous.
 */
export const RESERVED_USERNAMES = new Set([
  "admin",
  "anime",
  "api",
  "forgot-password",
  "login",
  "manga",
  "reset-password",
  "social",
  "verify-email",
]);

export function isAvailableUsername(username: string) {
  return !RESERVED_USERNAMES.has(username.toLowerCase());
}
