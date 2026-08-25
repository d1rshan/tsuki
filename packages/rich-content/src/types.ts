/**
 * The Rich Content contract: the document shape, presets, and limits shared by
 * authoring (web editor), persistence (API validation), and display (renderer).
 * A node the editor can create is also safe to save and render.
 */

export const RICH_CONTENT_VERSION = 1;

export type RichContentAttr = string | number | boolean | null;

export type RichContentMark = {
  type: "bold" | "italic" | "underline" | "strike" | "link";
  attrs?: Record<string, RichContentAttr>;
};

export type RichContentNode = {
  type: string;
  attrs?: Record<string, RichContentAttr>;
  marks?: RichContentMark[];
  text?: string;
  /** Nested nodes. Deliberately opaque: validation owns the structure rules. */
  content?: unknown[];
};

/** Versioned envelope around the raw Tiptap/ProseMirror JSON document. */
export type RichContent = {
  version: typeof RICH_CONTENT_VERSION;
  doc: { type: "doc"; content?: unknown[] };
};

/** Concatenated visible text of a document (spoiler contents included). */
export function richContentText(content: RichContent | null | undefined): string {
  let text = "";
  const stack: unknown[] = [content?.doc];
  while (stack.length) {
    const node = stack.pop();
    if (!node || typeof node !== "object") continue;
    const record = node as Record<string, unknown>;
    if (typeof record.text === "string") text += record.text;
    if (Array.isArray(record.content)) stack.push(...record.content);
  }
  return text;
}

export type MediaEmbedKind = "image" | "video" | "gif";

/** Block text alignment. Absence/null means the default (left). */
export type RichContentTextAlign = "left" | "center" | "right" | "justify";

export type RichContentPresetName = "bio" | "review";

export type RichContentPreset = {
  /** Visible text characters (spoiler contents included) the preset allows. */
  maxVisibleChars: number;
  maxMediaEmbeds: number;
  mediaKinds: MediaEmbedKind[];
  blocks: readonly string[];
};

export const RICH_CONTENT_PRESETS: Record<RichContentPresetName, RichContentPreset> = {
  bio: {
    maxVisibleChars: 500,
    maxMediaEmbeds: 3,
    mediaKinds: ["gif"],
    // ponytail: block lists are spelled out per preset; a richer capability
    // DSL is only worth it when a third preset appears.
    blocks: ["paragraph", "mediaEmbed"],
  },
  review: {
    maxVisibleChars: 10_000,
    maxMediaEmbeds: 10,
    mediaKinds: ["image", "video", "gif"],
    blocks: [
      "paragraph",
      "heading",
      "bulletList",
      "orderedList",
      "blockquote",
      "spoiler",
      "mediaEmbed",
    ],
  },
};
