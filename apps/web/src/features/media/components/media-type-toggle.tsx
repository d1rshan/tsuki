"use client";

import type { MediaType } from "@tsuki/api/types";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

import { MEDIA } from "../media";

export function MediaTypeToggle({
  value,
  onChange,
  compact = false,
}: {
  value: MediaType;
  onChange: (value: MediaType) => void;
  compact?: boolean;
}) {
  const nextValue = value === "ANIME" ? "MANGA" : "ANIME";

  return (
    <Button
      type="button"
      size="sm"
      onClick={() => onChange(nextValue)}
      aria-label={`Switch from ${MEDIA[value].label} to ${MEDIA[nextValue].label}`}
      className={cn(
        compact
          ? "rounded-lg sm:h-9 sm:rounded-xl sm:px-5 sm:text-sm"
          : "h-9 rounded-xl px-5 text-sm",
      )}
    >
      {MEDIA[value].label}
    </Button>
  );
}
