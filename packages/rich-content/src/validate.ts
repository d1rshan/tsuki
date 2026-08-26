import {
  RICH_CONTENT_PRESETS,
  RICH_CONTENT_VERSION,
  type MediaEmbedKind,
  type RichContent,
  type RichContentAttr,
  type RichContentMark,
  type RichContentPresetName,
} from "./types";

export type ValidateRichContentResult =
  | { ok: true; value: RichContent }
  | { ok: false; reason: string };

const MARK_TYPES = new Set(["bold", "italic", "underline", "strike", "link"]);
/** Blocks permitted inside blockquotes and spoilers. Spoilers never nest. */
const INNER_BLOCKS: ReadonlySet<string> = new Set([
  "paragraph",
  "heading",
  "bulletList",
  "orderedList",
  "mediaEmbed",
]);
const MAX_SPOILER_LABEL_CHARS = 100;

const TEXT_ALIGNS: ReadonlySet<string> = new Set(["left", "center", "right", "justify"]);

/** Blocks Tiptap allows inside a list item (paragraph plus nested lists). */
const LIST_ITEM_BLOCKS: ReadonlySet<string> = new Set(["paragraph", "bulletList", "orderedList"]);

/** The HTML <ol type> enum. */
const OL_TYPES: ReadonlySet<string> = new Set(["1", "a", "A", "i", "I"]);

/** Shared item-shape rules for both list flavours; false when malformed. */
function validListItems(node: Record<string, unknown>): boolean {
  if (!Array.isArray(node.content) || node.content.length === 0) return false;
  return node.content.every((item) => {
    if (!isPlainObject(item) || item.type !== "listItem") return false;
    if (item.marks !== undefined || item.text !== undefined) return false;
    return Array.isArray(item.content) && item.content.some((c) => c?.type === "paragraph");
  });
}

/** Sums visible text across list items (shape already verified). */
function listChars(
  node: Record<string, unknown>,
  presetName: RichContentPresetName,
): { chars: number } | null {
  let chars = 0;
  for (const item of node.content as Record<string, unknown>[]) {
    for (const child of item.content as unknown[]) {
      // Lists nest via Tab-indent, so items may contain paragraphs and lists.
      const result = walkBlock(child, presetName, LIST_ITEM_BLOCKS);
      if (!result) return null;
      chars += result.chars;
    }
  }
  return { chars };
}

/** Alignment is a review-preset capability; null/absent means default (left). */
function validTextAlign(
  node: Record<string, unknown>,
  knownAttrs: readonly string[],
  presetName: RichContentPresetName,
): boolean {
  if (!hasOnlyKnownAttrs(node, knownAttrs)) return false;
  const align = (node.attrs as Record<string, RichContentAttr> | undefined)?.textAlign ?? null;
  if (align === null) return true;
  return presetName === "review" && TEXT_ALIGNS.has(align as string);
}

function fail(reason: string): ValidateRichContentResult {
  return { ok: false, reason };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function httpsUrl(src: unknown): URL | null {
  if (typeof src !== "string") return null;
  try {
    const url = new URL(src);
    return url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

/** Canonical embed URLs the renderer can safely drop into an iframe. */
function canonicalVideoUrl(url: URL): string | null {
  const host = url.hostname.toLowerCase();
  const segments = url.pathname.split("/").filter(Boolean);
  const [firstSegment, secondSegment] = segments;

  if (host === "youtu.be" && firstSegment && /^[\w-]{6,20}$/.test(firstSegment)) {
    return `https://www.youtube-nocookie.com/embed/${firstSegment}`;
  }
  if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(host)) {
    const videoId = url.searchParams.get("v");
    if (videoId && /^[\w-]{6,20}$/.test(videoId)) {
      return `https://www.youtube-nocookie.com/embed/${videoId}`;
    }
  }
  if (["youtube-nocookie.com", "www.youtube-nocookie.com"].includes(host)) {
    const videoId = url.pathname.startsWith("/embed/") ? secondSegment : firstSegment;
    if (videoId && /^[\w-]{6,20}$/.test(videoId)) {
      return `https://www.youtube-nocookie.com/embed/${videoId}`;
    }
  }
  if (
    (host === "vimeo.com" || host === "www.vimeo.com") &&
    firstSegment &&
    /^\d{6,12}$/.test(firstSegment)
  ) {
    return `https://player.vimeo.com/video/${firstSegment}`;
  }

  return null;
}

function isGiphyHost(host: string): boolean {
  return host === "giphy.com" || host.endsWith(".giphy.com");
}

function hasOnlyKnownAttrs(node: Record<string, unknown>, allowed: readonly string[]): boolean {
  const attrs = node.attrs;
  if (attrs === undefined) return true;
  if (!isPlainObject(attrs)) return false;
  return Object.keys(attrs).every((key) => {
    const value = attrs[key];
    // Tiptap attribute defaults are `null`, which counts as absent.
    return allowed.includes(key) && (value === null || typeof value !== "object");
  });
}

function validLinkAttrs(attrs: Record<string, unknown>): boolean {
  if (typeof attrs.href !== "string") return false;
  try {
    if (new URL(attrs.href).protocol !== "https:") return false;
  } catch {
    return false;
  }
  // Tiptap v3 serializes every mark attr, including null defaults like `class`.
  const known = ["href", "target", "rel", "title", "class"];
  return Object.entries(attrs).every(
    ([key, value]) => value === null || (known.includes(key) && typeof value === "string"),
  );
}

function validMarks(marks: unknown): marks is RichContentMark[] {
  if (!Array.isArray(marks)) return false;

  return marks.every((mark) => {
    if (!isPlainObject(mark) || typeof mark.type !== "string" || !MARK_TYPES.has(mark.type)) {
      return false;
    }
    if (mark.type === "link") {
      return isPlainObject(mark.attrs) && validLinkAttrs(mark.attrs);
    }
    return mark.attrs === undefined;
  });
}

/** Returns the total visible text of an inline run, or null when malformed. */
function validInline(content: unknown): number | null {
  if (content === undefined) return 0;
  if (!Array.isArray(content)) return null;

  let chars = 0;
  for (const node of content) {
    if (!isPlainObject(node)) return null;

    if (node.type === "hardBreak") {
      if (node.content !== undefined || node.marks !== undefined || node.text !== undefined) {
        return null;
      }
      continue;
    }
    if (node.type === "text") {
      if (typeof node.text !== "string" || node.attrs !== undefined || node.content !== undefined) {
        return null;
      }
      if (node.marks !== undefined && !validMarks(node.marks)) return null;
      chars += node.text.length;
      continue;
    }
    return null;
  }
  return chars;
}

/**
 * Validates one block against the grammar shared with the editor extensions.
 * Returns its text/media contribution or null when rejected.
 */
function walkBlock(
  node: unknown,
  presetName: RichContentPresetName,
  allowedBlocks: ReadonlySet<string>,
): { chars: number; embeds: number } | null {
  if (!isPlainObject(node) || typeof node.type !== "string" || !allowedBlocks.has(node.type)) {
    return null;
  }
  const type = node.type;
  let chars = 0;
  let embeds = 0;

  switch (type) {
    case "paragraph": {
      if (!validTextAlign(node, ["textAlign"], presetName)) return null;
      const inline = validInline(node.content);
      if (inline === null) return null;
      chars += inline;
      break;
    }
    case "heading": {
      if (!validTextAlign(node, ["level", "textAlign"], presetName)) return null;
      const attrs = node.attrs as Record<string, RichContentAttr> | undefined;
      const level = (attrs?.level ?? null) as number | null;
      // Author-facing Heading/Subheading render semantic H2/H3; no H1 exists.
      if (level !== 2 && level !== 3) return null;
      const inline = validInline(node.content);
      if (inline === null) return null;
      chars += inline;
      break;
    }
    case "bulletList": {
      // BulletList defines no attributes, so its JSON never carries attrs.
      if (node.attrs !== undefined) return null;
      if (!validListItems(node)) return null;
      const counted = listChars(node, presetName);
      if (!counted) return null;
      chars += counted.chars;
      break;
    }
    case "orderedList": {
      // v3 OrderedList always serializes attrs {start, type} (defaults 1/null).
      // Both render into <ol> attributes, so bound them to the HTML enum.
      if (!hasOnlyKnownAttrs(node, ["start", "type"])) return null;
      const attrs = (node.attrs ?? {}) as Record<string, RichContentAttr>;
      const start = attrs.start ?? 1;
      const listType = attrs.type ?? null;
      if (typeof start !== "number" || !Number.isInteger(start) || start < 1) return null;
      if (listType !== null && !OL_TYPES.has(listType as string)) return null;
      if (!validListItems(node)) return null;
      const counted = listChars(node, presetName);
      if (!counted) return null;
      chars += counted.chars;
      break;
    }
    case "blockquote":
    case "spoiler": {
      if (type === "spoiler") {
        if (!hasOnlyKnownAttrs(node, ["label"])) return null;
        const attrs = node.attrs as Record<string, RichContentAttr> | undefined;
        const label = attrs?.label ?? null;
        if (
          label !== null &&
          (typeof label !== "string" || label.length > MAX_SPOILER_LABEL_CHARS)
        ) {
          return null;
        }
      } else if (node.attrs !== undefined) {
        return null;
      }
      if (!Array.isArray(node.content)) return null;
      for (const child of node.content) {
        const result = walkBlock(child, presetName, INNER_BLOCKS);
        if (!result) return null;
        chars += result.chars;
        embeds += result.embeds;
      }
      break;
    }
    case "mediaEmbed": {
      if (node.content !== undefined || node.marks !== undefined) return null;
      // validTextAlign also enforces the known-attr allowlist.
      if (!validTextAlign(node, ["kind", "src", "alt", "textAlign"], presetName)) return null;
      const attrs = (node.attrs ?? {}) as Record<string, RichContentAttr>;

      const preset = RICH_CONTENT_PRESETS[presetName];
      const kind = attrs.kind as MediaEmbedKind | undefined;
      if (!kind || !preset.mediaKinds.includes(kind)) return null;

      const src = httpsUrl(attrs.src);
      if (!src) return null;

      // Giphy-only rule must hold even for hand-crafted JSON.
      if (kind === "gif" && !isGiphyHost(src.hostname.toLowerCase())) return null;

      if (kind === "video") {
        const canonical = canonicalVideoUrl(src);
        if (!canonical) return null;
        // ponytail: rewrite in place — validated docs always carry embed-safe URLs.
        attrs.src = canonical;
      }

      if (kind === "image" && (typeof attrs.alt !== "string" || !attrs.alt.trim())) {
        return null;
      }

      embeds += 1;
      break;
    }
    default:
      return null;
  }

  return { chars, embeds };
}

/**
 * The security boundary for persisted Rich Content. Accepts untrusted JSON and
 * returns a normalised document or the reason it was rejected; callers own the
 * HTTP mapping.
 */
export function validateRichContent(
  value: unknown,
  presetName: RichContentPresetName,
): ValidateRichContentResult {
  if (!isPlainObject(value)) return fail("rich content must be an object");
  if (value.version !== RICH_CONTENT_VERSION) return fail("unsupported rich content version");
  if (!isPlainObject(value.doc) || value.doc.type !== "doc") return fail("missing document root");
  if (
    value.doc.attrs !== undefined ||
    value.doc.marks !== undefined ||
    value.doc.text !== undefined ||
    (value.doc.content !== undefined && !Array.isArray(value.doc.content))
  ) {
    return fail("unexpected fields on document root");
  }

  const preset = RICH_CONTENT_PRESETS[presetName];
  const allowedBlocks = new Set(preset.blocks);
  let chars = 0;
  let embeds = 0;

  for (const [index, block] of (value.doc.content ?? []).entries()) {
    const result = walkBlock(block, presetName, allowedBlocks);
    if (!result) {
      const shape = JSON.stringify(block) ?? String(block);
      return fail(`block ${index} not allowed in "${presetName}" preset: ${shape.slice(0, 300)}`);
    }
    chars += result.chars;
    embeds += result.embeds;
  }

  if (chars > preset.maxVisibleChars) {
    return fail(`exceeds the ${preset.maxVisibleChars} character limit`);
  }
  if (embeds > preset.maxMediaEmbeds) {
    return fail(`exceeds the ${preset.maxMediaEmbeds} embed limit`);
  }

  return { ok: true, value: value as unknown as RichContent };
}

/** True when a document carries no visible text and no media worth saving. */
export function isEmptyRichContent(content: RichContent | null | undefined): boolean {
  if (!content?.doc) return true;

  let hasText = false;
  let hasMedia = false;
  const stack: unknown[] = [content.doc];
  while (stack.length && !hasText && !hasMedia) {
    const node = stack.pop();
    if (!isPlainObject(node)) continue;
    if (node.type === "text" && typeof node.text === "string" && node.text.trim()) hasText = true;
    if (node.type === "mediaEmbed") hasMedia = true;
    if (Array.isArray(node.content)) stack.push(...node.content);
  }
  return !hasText && !hasMedia;
}
