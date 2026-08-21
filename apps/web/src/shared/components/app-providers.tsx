"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { Toaster } from "@/shared/components/ui/sonner";
import { getQueryClient } from "@/shared/lib/query-client";
import { THEME_CLASSES } from "@/features/theme/themes";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      themes={THEME_CLASSES}
    >
      <QueryClientProvider client={queryClient}>
        <NuqsAdapter>{children}</NuqsAdapter>
        {process.env.NODE_ENV === "development" ? <ReactQueryDevtools /> : null}
      </QueryClientProvider>
      <Toaster />
    </ThemeProvider>
  );
}
