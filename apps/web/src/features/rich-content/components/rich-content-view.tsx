"use client";

import type { RichContent } from "@tsuki/rich-content";
import { renderRichContent, type RichContentMode } from "@tsuki/rich-content";

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

/**
 * Server-renderable display for a saved Rich Content document. Renders on the
 * server via Tiptap's static renderer; only spoiler reveals hydrate.
 */
export function RichContentView({
  content,
  mode = "full",
  className,
}: {
  content: unknown;
  mode?: RichContentMode;
  className?: string;
}) {
  // Documents are validated before persistence; renderRichContent re-checks
  // and renders nothing if anything hostile slipped through another path.
  const html = renderRichContent(content as RichContent | null, mode);
  if (!html) return null;

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
