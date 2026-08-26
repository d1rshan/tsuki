"use client";

import { cn } from "@/shared/lib/utils";

/** Reveals the spoiler the event landed in; events delegate off static HTML. */
function reveal(target: Element) {
  const spoiler = target.closest<HTMLElement>("[data-spoiler]");
  if (!spoiler || spoiler.classList.contains("revealed")) return;

  spoiler.classList.add("revealed");
  spoiler.setAttribute("aria-expanded", "true");
  spoiler.setAttribute("role", "group");
  spoiler.removeAttribute("tabindex");
}

/** The only hydrated part of a rendered document: spoiler reveals. */
export function SpoilerLayer({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={cn("rich-content-host", className)}
      dangerouslySetInnerHTML={{ __html: html }}
      onClick={(event) => event.target instanceof Element && reveal(event.target)}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && event.target instanceof Element) {
          reveal(event.target);
        }
      }}
    />
  );
}
