import type { DiscoveryUserSummary } from "./model";

export const DISCOVERY_LIMIT = 24;

type GetUserDiscovery = (
  viewerId: string,
  options: { limit: number; usernamePrefix?: string },
) => Promise<DiscoveryUserSummary[]>;

export async function discoverUsers(
  viewerId: string,
  username: string | undefined,
  getUserDiscovery: GetUserDiscovery,
) {
  return {
    users: await getUserDiscovery(viewerId, { limit: DISCOVERY_LIMIT, usernamePrefix: username }),
  };
}
