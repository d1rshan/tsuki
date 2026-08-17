import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { getProfileOverview } from "@/features/profile/data";
import { AppProviders } from "@/shared/components/app-providers";
import { getSession } from "@/shared/lib/session";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "Tsuki",
    template: "%s | Tsuki",
  },
  description: "Track, rate, and review anime and manga.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = await getSession();
  const profile = user?.username ? await getProfileOverview(user.username) : null;

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <AppProviders initialTheme={profile?.profile?.theme}>{children}</AppProviders>
      </body>
    </html>
  );
}
