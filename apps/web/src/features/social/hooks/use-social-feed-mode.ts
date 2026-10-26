"use client";

import { parseAsStringEnum, useQueryState } from "nuqs";

export type SocialFeedMode = "public" | "following";

export function useSocialFeedMode() {
  return useQueryState(
    "feed",
    parseAsStringEnum<SocialFeedMode>(["public", "following"]).withDefault("public"),
  );
}
