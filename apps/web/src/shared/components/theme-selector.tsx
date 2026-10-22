"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

export function ThemeSelector() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Tabs
      value={resolvedTheme === "dark" ? "dark" : "light"}
      onValueChange={(value) => setTheme(String(value))}
      variant="rounded"
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
  );
}
