"use client";

import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider, useTheme } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { Toaster } from "@/shared/components/ui/sonner";
import { getQueryClient } from "@/shared/lib/query-client";
import { THEME_IDS } from "@/shared/lib/themes";

export function AppProviders({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme?: string | null;
}) {
  const queryClient = getQueryClient();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={initialTheme ?? "system"}
      enableSystem
      disableTransitionOnChange
      themes={THEME_IDS}
    >
      <PersistedTheme initialTheme={initialTheme} />
      <QueryClientProvider client={queryClient}>
        <NuqsAdapter>{children}</NuqsAdapter>
        {process.env.NODE_ENV === "development" ? <ReactQueryDevtools /> : null}
      </QueryClientProvider>
      <Toaster />
    </ThemeProvider>
  );
}

function PersistedTheme({ initialTheme }: { initialTheme?: string | null }) {
  const { setTheme } = useTheme();

  useEffect(() => {
    if (initialTheme) setTheme(initialTheme);
  }, [initialTheme, setTheme]);

  return null;
}
