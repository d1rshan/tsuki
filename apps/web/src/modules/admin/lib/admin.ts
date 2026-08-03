import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export function isAdmin(role?: string | null) {
  return role === "admin" || role === "owner";
}

export async function requireAdmin() {
  const { user } = await auth();

  if (!isAdmin(user?.role)) {
    redirect("/");
  }

  return user;
}
