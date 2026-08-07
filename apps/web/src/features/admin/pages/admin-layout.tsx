import { Suspense } from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { LoadingIndicator } from "@/shared/components/loading-indicator";

import { AdminSidebar } from "../components/admin-sidebar";
import { AdminSiteHeader } from "../components/admin-site-header";
import { requireAdmin } from "../require-admin";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingIndicator className="min-h-screen" label="Loading admin" />}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}

async function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AdminSidebar variant="inset" />
      <SidebarInset>
        <AdminSiteHeader />
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
