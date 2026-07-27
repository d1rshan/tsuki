"use client";

import type { ReactNode } from "react";
import { useQueryState, parseAsStringEnum } from "nuqs";

import { type MediaType } from "@/lib/media";
import { MediaTypeToggle } from "@/components/media-type-toggle";

export function ProfileMediaToggle({ anime, manga }: { anime: ReactNode; manga: ReactNode }) {
  const [type, setType] = useQueryState(
    "type",
    parseAsStringEnum<MediaType>(["anime", "manga"]).withDefault("anime"),
  );

  return (
    <div className="space-y-8">
      <MediaTypeToggle value={type} onChange={setType} />
      {type === "anime" ? anime : manga}
    </div>
  );
}
