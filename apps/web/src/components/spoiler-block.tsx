"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function SpoilerBlock({ content }: { content: string }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <span
      onClick={() => setRevealed(true)}
      className={cn(
        "cursor-pointer rounded-sm transition-colors duration-200 whitespace-pre-wrap box-decoration-clone",
        revealed ? "text-foreground/90" : "bg-muted text-transparent select-none hover:bg-muted/80",
      )}
      title={revealed ? "" : "Click to reveal spoiler"}
    >
      {content}
    </span>
  );
}
