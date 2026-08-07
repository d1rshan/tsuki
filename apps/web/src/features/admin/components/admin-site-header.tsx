import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/shared/components/theme-toggle";

export function AdminSiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center justify-between border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) lg:px-6">
      <SidebarTrigger className="-ml-1" />
      <ThemeToggle />
    </header>
  );
}
