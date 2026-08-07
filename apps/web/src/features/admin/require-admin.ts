import "server-only";

import { redirect } from "next/navigation";

import { getSession } from "@/shared/lib/session";

import { isAdminRole } from "./permissions";

export async function requireAdmin() {
  const { user } = await getSession();

  if (!isAdminRole(user?.role)) redirect("/");

  return user;
}
