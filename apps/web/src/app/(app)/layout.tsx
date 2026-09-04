import { Suspense } from "react";

import { Navbar } from "@/features/navbar/components";
import { Footer } from "@/shared/components/footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* ponytail: Suspense is required — usePathname in the client Navbar blocks prerender without it. */}
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>
      <main className="container mx-auto max-w-6xl flex-1 px-4">{children}</main>
      <Footer />
    </div>
  );
}
