import { Suspense } from "react";

import { MediaNavigationProvider } from "@/features/media/components/media-navigation-provider";
import { Navbar } from "@/features/navbar/components";
// import { BetaFeedback } from "@/shared/components/beta-feedback";
import { Footer } from "@/shared/components/footer";
import { SoftBlurEdge } from "@/shared/components/soft-blur-edge";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <MediaNavigationProvider>
      <div className="relative flex min-h-screen flex-col">
        {/* ponytail: Suspense is required — usePathname in the client Navbar blocks prerender without it. */}
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
        <SoftBlurEdge edge="top" />
        <main className="container mx-auto max-w-5xl flex-1 px-4 @container">{children}</main>
        <Footer />
        {/* <BetaFeedback /> */}
      </div>
    </MediaNavigationProvider>
  );
}
