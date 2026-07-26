"use client";

import { cn } from "@/lib/utils";

export type MediaType = "anime" | "manga";

export function MediaTypeToggle({
  value,
  onChange,
}: {
  value: MediaType;
  onChange: (value: MediaType) => void;
}) {
  const options: { value: MediaType; label: string }[] = [
    { value: "anime", label: "Anime" },
    { value: "manga", label: "Manga" },
  ];

  return (
    <div className="flex items-center gap-2 p-1.5 bg-muted/30 backdrop-blur-md border border-border/50 rounded-2xl w-fit shadow-sm">
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "px-5 py-2 text-sm font-semibold transition-all duration-300 rounded-xl",
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
