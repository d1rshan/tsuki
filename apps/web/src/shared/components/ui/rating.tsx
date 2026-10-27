"use client";

import { Star } from "lucide-react";

import { cn } from "@/shared/lib/utils";

function Rating({
  value,
  onValueChange,
  max = 10,
  disabled = false,
}: {
  value: number;
  onValueChange: (value: number) => void;
  max?: number;
  disabled?: boolean;
}) {
  return (
    <div
      data-slot="rating"
      className="flex min-h-10.5 w-full items-center gap-0.5 rounded-xl bg-muted px-2.5 py-1"
    >
      {Array.from({ length: max }, (_, index) => index + 1).map((score) => (
        <button
          type="button"
          key={score}
          disabled={disabled}
          onClick={() => onValueChange(score === value ? 0 : score)}
          className="group flex h-8 min-w-0 flex-1 items-center justify-center rounded-lg text-muted-foreground transition-colors outline-none hover:bg-transparent hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50"
          aria-label={`Rate ${score} out of ${max}`}
          aria-pressed={value === score}
        >
          <Star
            aria-hidden="true"
            className={cn(
              "size-4 shrink-0 transition-colors sm:size-5",
              value >= score && "fill-foreground/90 text-foreground/90",
            )}
          />
        </button>
      ))}
    </div>
  );
}

export { Rating };
