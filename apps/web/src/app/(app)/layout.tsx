import { Suspense } from "react";

import { NavbarServer } from "@/features/navbar/components/navbar-server";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <NavbarServer />
      </Suspense>
      <main className="flex-1">{children}</main>
    </div>
  );
}
