import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavbarAuth({ isAuthenticated }: { isAuthenticated: boolean }) {
  const pathname = usePathname();

  if (isAuthenticated) return null;

  return (
    <Link
      href="/login"
      className={`inline-flex items-center py-[7px] text-sm font-medium transition-colors duration-200 ${
        pathname === "/login" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      Login
    </Link>
  );
}
