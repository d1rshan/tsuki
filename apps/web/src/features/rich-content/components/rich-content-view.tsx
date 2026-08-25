"use client";

import { useEffect, useRef } from "react";

import type { RichContent } from "@tsuki/rich-content";
import { renderRichContent, type RichContentMode } from "@tsuki/rich-content";

import { cn } from "@/shared/lib/utils";

/**
 * Reveals spoilers by event delegation over statically rendered Rich Content.
 * Readers never load the editor bundle — just this tiny click handler.
 */
function SpoilerSurface({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  function reveal(target: Element) {
    const spoiler = target.closest<HTMLElement>("[data-spoiler]");
    if (!spoiler || spoiler.classList.contains("revealed")) return;

    spoiler.classList.add("revealed");
    spoiler.setAttribute("aria-expanded", "true");
    spoiler.setAttribute("role", "group");
    spoiler.removeAttribute("tabindex");
  }

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    function onClick(event: MouseEvent) {
      if (event.target instanceof Element) reveal(event.target);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Enter" && event.key !== " ") return;
      if (event.target instanceof Element) reveal(event.target);
    }

    node.addEventListener("click", onClick);
    node.addEventListener("keydown", onKeyDown);
    return () => {
      node.removeEventListener("click", onClick);
      node.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return <div ref={ref} dangerouslySetInnerHTML={{ __html: html }} />;
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
    <div className={cn("rich-content-host", className)}>
      <SpoilerSurface html={html} />
    </div>
  );
}
