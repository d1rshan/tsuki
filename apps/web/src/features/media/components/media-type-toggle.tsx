"use client";

import type { MediaType } from "@tsuki/api/types";

import { Button } from "@/shared/components/ui/button";

import { MEDIA } from "../media";

export function MediaTypeToggle({
  value,
  onChange,
}: {
  value: MediaType;
  onChange: (value: MediaType) => void;
}) {
  const nextValue = value === "ANIME" ? "MANGA" : "ANIME";

  return (
    <Button
      type="button"
      size="lg"
      onClick={() => onChange(nextValue)}
      aria-label={`Switch from ${MEDIA[value].label} to ${MEDIA[nextValue].label}`}
    >
      {MEDIA[value].label}
    </Button>
  );
}
