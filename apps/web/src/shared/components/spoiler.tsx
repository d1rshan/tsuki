"use client";

import { useState, type ReactNode } from "react";

export function Spoiler({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const [isRevealed, setIsRevealed] = useState(false);

  if (isRevealed) return <div className="text-foreground/90">{children}</div>;

  return (
    <button
      type="button"
      className="whitespace-pre-wrap rounded-sm text-left box-decoration-clone transition-colors cursor-pointer bg-muted text-transparent select-none hover:bg-muted/80"
      onClick={() => setIsRevealed(true)}
      aria-label="Reveal spoiler"
    >
      {fallback ?? children}
    </button>
  );
}
