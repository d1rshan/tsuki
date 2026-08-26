"use client";

import { useCallback, useState } from "react";
import type { JSONContent } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";

import type { RichContent, RichContentPresetName } from "@tsuki/rich-content";
import {
  isEmptyRichContent,
  RICH_CONTENT_VERSION,
  richContentExtensions,
} from "@tsuki/rich-content";

import { cn } from "@/shared/lib/utils";

import { EditorToolbar } from "./editor-toolbar";
import { GiphyPickerDialog } from "./giphy-picker-dialog";
import { MediaEmbedDialog, type InsertAttrs } from "./insert-dialogs";
import { LinkDialog } from "./link-dialog";
import { SpoilerDialog } from "./spoiler-dialog";

/**
 * Wraps an editor JSON tree in the versioned Rich Content envelope.
 * The round-trip through JSON strips reactive proxies (TanStack Form, etc.):
 * values that survive into server-action arguments must be plain data, or
 * Flight turns their properties into unresolvable temporary references.
 */
function toRichContent(json: Record<string, unknown>): RichContent {
  return JSON.parse(JSON.stringify({ version: RICH_CONTENT_VERSION, doc: json })) as RichContent;
}

const EMPTY_DOC: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };

export type InsertKind = "link" | "image" | "video" | "gif" | "spoiler" | null;

export function RichContentEditor({
  value,
  onChange,
  preset,
  disabled = false,
  ariaLabel,
  className,
}: {
  value: RichContent | null;
  onChange: (value: RichContent | null) => void;
  preset: RichContentPresetName;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: richContentExtensions(),
    content: (value?.doc as JSONContent) ?? EMPTY_DOC,
    onUpdate: ({ editor }) => {
      const next = toRichContent(editor.getJSON() as Record<string, unknown>);
      onChange(isEmptyRichContent(next) ? null : next);
    },
    editorProps: {
      attributes: {
        class: cn(
          "rich-content-editing",
          "min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2",
          "text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
          "[&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
          className,
        ),
        "aria-label": ariaLabel ?? "Rich text editor",
      },
    },
  });

  const [dialog, setDialog] = useState<InsertKind>(null);

  const insertMedia = useCallback(
    (attrs: InsertAttrs) => {
      editor?.chain().focus().insertContent({ type: "mediaEmbed", attrs }).run();
    },
    [editor],
  );

  const spoilerAncestor = useCallback(() => {
    if (!editor) return -1;
    const { $from } = editor.state.selection;
    for (let depth = $from.depth; depth > 0; depth--) {
      if ($from.node(depth).type.name === "spoiler") return $from.before(depth);
    }
    return -1;
  }, [editor]);

  const applySpoiler = useCallback(
    (label: string) => {
      if (!editor) return;
      const attrs = { label: label || null };

      if (spoilerAncestor() >= 0) {
        editor.chain().focus().updateAttributes("spoiler", attrs).run();
        return;
      }

      const { empty } = editor.state.selection;
      if (empty) {
        editor
          .chain()
          .focus()
          .insertContent({
            type: "spoiler",
            attrs,
            content: [{ type: "paragraph" }],
          })
          .run();
      } else {
        editor.chain().focus().toggleWrap("spoiler").run();
        const pos = spoilerAncestor();
        if (pos >= 0) {
          editor
            .chain()
            .command(({ tr }) => {
              tr.setNodeMarkup(pos, undefined, {
                ...tr.doc.nodeAt(pos)?.attrs,
                ...attrs,
              });
              return true;
            })
            .run();
        }
      }
    },
    [editor, spoilerAncestor],
  );

  if (!editor) return <div className="min-h-28 animate-pulse rounded-md bg-muted/50" />;

  return (
    <div className="space-y-1.5">
      <EditorToolbar editor={editor} preset={preset} onOpenDialog={setDialog} />
      <EditorContent editor={editor} />

      <LinkDialog editor={editor} open={dialog === "link"} onOpenChange={setDialog} />
      <MediaEmbedDialog
        kind="image"
        open={dialog === "image"}
        onInsert={insertMedia}
        onOpenChange={setDialog}
      />
      <MediaEmbedDialog
        kind="video"
        open={dialog === "video"}
        onInsert={insertMedia}
        onOpenChange={setDialog}
      />
      <GiphyPickerDialog
        preset={preset}
        open={dialog === "gif"}
        onInsert={insertMedia}
        onOpenChange={setDialog}
      />
      <SpoilerDialog open={dialog === "spoiler"} onApply={applySpoiler} onOpenChange={setDialog} />
    </div>
  );
}
