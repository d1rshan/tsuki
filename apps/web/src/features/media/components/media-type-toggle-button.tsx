"use client";

import type { MediaType } from "@tsuki/api/types";

import { Button } from "@/shared/components/ui/button";

import { MEDIA } from "../media";

export function MediaTypeToggleButton({
  mediaType,
  onChange,
}: {
  mediaType: MediaType;
  onChange: (mediaType: MediaType) => void;
}) {
  const nextMediaType = mediaType === "ANIME" ? "MANGA" : "ANIME";

  return (
    <Button
      type="button"
      size="lg"
      onClick={() => onChange(nextMediaType)}
      aria-label={`Switch from ${MEDIA[mediaType].label} to ${MEDIA[nextMediaType].label}`}
    >
      {MEDIA[mediaType].label}
    </Button>
  );
}
