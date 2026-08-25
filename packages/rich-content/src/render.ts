import type { JSONContent } from "@tiptap/core";
import { renderToHTMLString } from "@tiptap/static-renderer";

import { richContentExtensions } from "./extensions";
import type { RichContent } from "./types";
import { validateRichContent } from "./validate";

export type RichContentMode = "full" | "compact";

/**
 * Statically renders a saved Rich Content document to HTML for server
 * components. Readers never download the editor: this runs on Tiptap's static
 * renderer with the same extension set the editor uses. Invalid or hostile
 * documents render as nothing — persistence already rejected them.
 */
export function renderRichContent(
  content: RichContent | null | undefined,
  mode: RichContentMode = "full",
): string {
  if (!content) return "";
  if (!validateRichContent(content, "review").ok && !validateRichContent(content, "bio").ok) {
    return "";
  }

  const html = renderToHTMLString({
    content: content.doc as JSONContent,
    extensions: richContentExtensions({ undoRedo: false }),
  });

  return `<div class="rich-content rich-content--${mode}">${html}</div>`;
}
