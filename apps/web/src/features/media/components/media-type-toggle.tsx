"use client";

import type { MediaType } from "@tsuki/api/types";

import { cn } from "@/lib/utils";

import { MEDIA, MEDIA_TYPES } from "../media";

export function MediaTypeToggle({
  value,
  onChange,
}: {
  value: MediaType;
  onChange: (value: MediaType) => void;
}) {
  const options = MEDIA_TYPES.map((value) => ({ value, label: MEDIA[value].label }));

  return (
    <div className="flex w-fit items-center gap-1 rounded-lg border bg-muted/30 p-1">
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            type="button"
            key={option.value}
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-semibold transition-colors",
              isActive
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-primary hover:bg-primary/10",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
