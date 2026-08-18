import { notFound } from "next/navigation";

import { parseUsername } from "@/shared/lib/username";

export async function requireValidUsername(params: Promise<{ username: string }>) {
  const { username } = await params;
  const parsedUsername = parseUsername(username);

  if (!parsedUsername) notFound();

  return parsedUsername;
}
