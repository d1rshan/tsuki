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
    <div className="flex w-fit items-center gap-2 rounded-2xl border border-border/50 bg-muted/30 p-1.5 shadow-sm backdrop-blur-md">
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            type="button"
            key={option.value}
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            className={cn(
              "rounded-xl px-5 py-2 text-sm font-semibold transition-all duration-300",
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
