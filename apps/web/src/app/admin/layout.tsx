import { Shield, Users, Settings, Activity } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";

import { cn } from "@/lib/utils";

const sidebarLinks = [
  {
    title: "Overview",
    href: "/admin",
    icon: Activity,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers();
  const pathname = headerList.get("x-invoke-path") || "/admin/users"; // Very basic fallback if headers trick doesn't work, we'll use a better approach in a client component or just simple server styles. Wait, server components don't have access to pathname directly.

  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full flex-col md:flex-row">
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r bg-muted/20">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <Shield className="h-5 w-5 text-primary" />
            <span>Admin Panel</span>
          </Link>
        </div>
        <nav className="grid gap-1 px-2 py-4">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.title}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto bg-background p-4 md:p-6 lg:p-8">{children}</main>
    </div>
  );
}
