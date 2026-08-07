import type { Metadata } from "next";

import { AppProviders } from "@/shared/components/app-providers";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Tsuki",
    template: "%s | Tsuki",
  },
  description: "Track, rate, and review anime and manga.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
