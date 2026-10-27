"use client";

import { Suspense } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { AuthDialogProvider } from "@/features/auth/components/auth-dialog-provider";
import { Toaster } from "@/shared/components/ui/sonner";
import { getQueryClient } from "@/shared/lib/query-client";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="tsuki-color-mode"
    >
      <QueryClientProvider client={queryClient}>
        {/* btw: NuqsAdapter reads searchParams on render — Suspense keeps it from blocking prerender. */}
        <Suspense fallback={null}>
          <NuqsAdapter>
            <AuthDialogProvider>{children}</AuthDialogProvider>
          </NuqsAdapter>
        </Suspense>
        {process.env.NODE_ENV === "development" ? <ReactQueryDevtools /> : null}
      </QueryClientProvider>
      <Toaster />
    </ThemeProvider>
  );
}
