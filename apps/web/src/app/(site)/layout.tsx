import { Suspense } from "react";

import { SiteNavigationServer } from "@/features/navigation/components/site-navigation-server";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <SiteNavigationServer />
      </Suspense>
      <main className="flex-1">{children}</main>
    </div>
  );
}
