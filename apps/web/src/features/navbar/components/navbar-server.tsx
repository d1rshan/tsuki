import { getSession } from "@/shared/lib/session";

import { Navbar } from "./";

export async function NavbarServer() {
  const { user } = await getSession();

  return <Navbar user={user ? { role: user.role, username: user.username } : null} />;
}
