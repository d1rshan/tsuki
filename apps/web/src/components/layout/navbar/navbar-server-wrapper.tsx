import { auth } from "@/lib/auth";
import { Navbar } from "./index";

export async function NavbarServerWrapper() {
  const { user } = await auth();

  return <Navbar user={user} />;
}
