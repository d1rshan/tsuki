import { getSession } from "@/shared/lib/session";

import { SiteNavigation } from "./site-navigation";

export async function SiteNavigationServer() {
  const { user } = await getSession();

  return <SiteNavigation user={user ? { role: user.role, username: user.username } : null} />;
}
