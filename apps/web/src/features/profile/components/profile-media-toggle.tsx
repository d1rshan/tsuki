"use client";

import type { ReactNode } from "react";
import { useQueryState, parseAsStringEnum } from "nuqs";

import type { MediaType } from "@tsuki/api/types";
import { MediaTypeToggle } from "@/features/media/components/media-type-toggle";

export function ProfileMediaToggle({ anime, manga }: { anime: ReactNode; manga: ReactNode }) {
  const [type, setType] = useQueryState(
    "type",
    parseAsStringEnum<MediaType>(["ANIME", "MANGA"]).withDefault("ANIME"),
  );

  return (
    <div className="space-y-8">
      <MediaTypeToggle value={type} onChange={setType} />
      {type === "ANIME" ? anime : manga}
    </div>
  );
}
