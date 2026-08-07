import "server-only";

import { headers } from "next/headers";

import { auth } from "@tsuki/auth/server";

export async function getUserCount() {
  const result = await auth.api.listUsers({
    query: { limit: 1 },
    headers: await headers(),
  });

  return result.total;
}
