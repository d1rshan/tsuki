import type { Metadata } from "next";

import { AuthLayout } from "@/features/auth/layouts/auth-layout";

// Applies to every auth page: sign-in and account recovery never belong in an index.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>;
}
