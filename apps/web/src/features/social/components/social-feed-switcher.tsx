"use client";

import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

import { useSocialFeedMode } from "../hooks/use-social-feed-mode";

export function SocialFeedSwitcher() {
  const [mode, setMode] = useSocialFeedMode();

  return (
    <Tabs value={mode} onValueChange={(value) => void setMode(value as typeof mode)}>
      <TabsList aria-label="Activity audience">
        <TabsTrigger className="px-2.5 py-1 text-sm" value="public">
          Public
        </TabsTrigger>
        <TabsTrigger className="px-2.5 py-1 text-sm" value="following">
          Following
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
