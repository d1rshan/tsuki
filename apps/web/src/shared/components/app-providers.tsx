"use client";

import { Suspense, useEffect, useRef } from "react";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { useSession } from "@tsuki/auth/client";

import { AuthDialogProvider } from "@/features/auth/components/auth-dialog-provider";
import { Toaster } from "@/shared/components/ui/sonner";
import { getQueryClient } from "@/shared/lib/query-client";

function ClearPreviousActivity() {
  const queryClient = useQueryClient();
  const { data: session, isPending } = useSession();
  const previousUser = useRef<string | null>(null);
  const userId = session?.user?.id ?? null;

  useEffect(() => {
    if (isPending) return;
    const previousId = previousUser.current;
    previousUser.current = userId;
    if (!previousId || previousId === userId) return;
    const filter = {
      predicate: (query: { queryKey: readonly unknown[] }) =>
        query.queryKey[0] === "media" &&
        query.queryKey[1] === "activity" &&
        query.queryKey[4] === previousId,
    };
    void queryClient.cancelQueries(filter);
    queryClient.removeQueries(filter);
  }, [isPending, queryClient, userId]);

  return null;
}

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
        <ClearPreviousActivity />
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
