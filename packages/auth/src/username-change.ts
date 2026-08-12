export const USERNAME_CHANGE_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

export function isUsernameChangeOnCooldown(changedAt: Date | null, now = Date.now()): boolean {
  return changedAt !== null && now - changedAt.getTime() < USERNAME_CHANGE_COOLDOWN_MS;
}
