"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

export function Spoiler({ children }: { children: string }) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <button
      type="button"
      className={cn(
        "whitespace-pre-wrap rounded-sm text-left box-decoration-clone transition-colors",
        isRevealed
          ? "cursor-text text-foreground/90"
          : "cursor-pointer bg-muted text-transparent select-none hover:bg-muted/80",
      )}
      onClick={() => setIsRevealed(true)}
      aria-label={isRevealed ? undefined : "Reveal spoiler"}
    >
      {children}
    </button>
  );
}
