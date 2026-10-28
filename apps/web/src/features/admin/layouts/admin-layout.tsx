import { Suspense } from "react";

import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import { Loader } from "@/shared/components/loader";

import { AdminSidebar } from "../components/admin-sidebar";
import { AdminSiteHeader } from "../components/admin-site-header";
import { requireAdmin } from "../require-admin";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-3 p-6">
          <h1 className="text-2xl font-semibold">Administration</h1>
          <p className="text-muted-foreground">Checking access…</p>
          <Loader />
        </main>
      }
    >
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
