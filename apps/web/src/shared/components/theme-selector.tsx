"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

const subscribe = () => () => {};

export function ThemeSelector({ compactMobile = false }: { compactMobile?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  // The saved theme is only available in the browser, after hydration.
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  return (
    <>
      {compactMobile && (
        <div className="rounded-full bg-muted p-1 md:hidden">
          <Button
            variant="ghost"
            aria-label={
              hydrated && resolvedTheme === "dark"
                ? "Switch to light theme"
                : "Switch to dark theme"
            }
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="size-8.5 rounded-full p-0"
          >
            {hydrated && resolvedTheme === "dark" ? (
              <Moon aria-hidden="true" />
            ) : (
              <Sun aria-hidden="true" />
            )}
          </Button>
        </div>
      )}
      <Tabs
        value={hydrated ? (resolvedTheme === "dark" ? "dark" : "light") : null}
        onValueChange={(value) => setTheme(String(value))}
        variant="rounded"
        className={compactMobile ? "max-md:hidden" : undefined}
      >
        <TabsList aria-label="Color theme" className="max-md:h-10.5">
          <TabsTrigger value="light" aria-label="Light theme" className="px-2">
            <Sun aria-hidden="true" />
          </TabsTrigger>
          <TabsTrigger value="dark" aria-label="Dark theme" className="px-2">
            <Moon aria-hidden="true" />
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </>
  );
}
