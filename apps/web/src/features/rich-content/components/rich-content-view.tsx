import type { RichContent } from "@tsuki/rich-content";
import { renderRichContent, type RichContentMode } from "@tsuki/rich-content";

import { SpoilerLayer } from "./spoiler-layer";

/**
 * Display for a saved Rich Content document. The HTML is rendered by Tiptap's
 * static renderer (server-side when the caller is a server component); the
 * only client island is SpoilerLayer's spoiler-reveal handlers.
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

  return <SpoilerLayer html={html} className={className} />;
}
