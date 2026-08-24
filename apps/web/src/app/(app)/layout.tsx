import { Suspense } from "react";

import { NavbarServer } from "@/features/navbar/components/navbar-server";
import { Footer } from "@/shared/components/footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <NavbarServer />
      </Suspense>
      <main className="container mx-auto max-w-6xl flex-1 px-4">{children}</main>
      <Footer />
    </div>
  );
}
