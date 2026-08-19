"use client";

import type { ReactNode } from "react";
import { useQueryState, parseAsStringEnum } from "nuqs";

import type { MediaType } from "@tsuki/api/types";

import { MEDIA } from "@/features/media/media";
import { Button } from "@/shared/components/ui/button";

export function ProfileMediaToggle({ anime, manga }: { anime: ReactNode; manga: ReactNode }) {
  const [type, setType] = useQueryState(
    "type",
    parseAsStringEnum<MediaType>(["ANIME", "MANGA"]).withDefault("ANIME"),
  );

  const nextType = type === "ANIME" ? "MANGA" : "ANIME";

  return (
    <div className="space-y-8">
      <Button
        type="button"
        size="lg"
        onClick={() => void setType(nextType)}
        aria-label={`Switch from ${MEDIA[type].label} to ${MEDIA[nextType].label}`}
      >
        {MEDIA[type].label}
      </Button>
      {type === "ANIME" ? anime : manga}
    </div>
  );
}
