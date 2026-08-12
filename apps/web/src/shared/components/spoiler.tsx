"use client";

import { type ReactNode, useState } from "react";

export function Spoiler({ children }: { children: ReactNode }) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div>
      {isRevealed ? (
        children
      ) : (
        <button
          type="button"
          className="w-full cursor-pointer rounded-sm bg-muted px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/80"
          onClick={() => setIsRevealed(true)}
        >
          Reveal spoiler
        </button>
      )}
    </div>
  );
}
