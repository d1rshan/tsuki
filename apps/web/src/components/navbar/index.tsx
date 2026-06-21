import { auth } from "@/lib/auth";

import { NavbarClient } from "./navbar-client";

export async function Navbar() {
  const { user } = await auth();
  const username = user?.username ?? null;

  return <NavbarClient username={username} />;
}
