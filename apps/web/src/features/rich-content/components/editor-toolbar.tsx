"use client";

import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";
import {
  Bold,
  Clapperboard,
  EyeOff,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  QuoteIcon,
  Strikethrough,
  Underline as UnderlineIcon,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

import type { InsertKind } from "./rich-content-editor";

function ToolButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={disabled}
            aria-label={label}
            aria-pressed={active}
            className={active ? "bg-primary/10 text-primary" : undefined}
            onClick={onClick}
          >
            {children}
          </Button>
        }
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function EditorToolbar({
  editor,
  preset,
  onOpenDialog,
}: {
  editor: Editor;
  preset: "bio" | "review";
  onOpenDialog: (dialog: InsertKind) => void;
}) {
  const isReview = preset === "review";

  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      isBold: editor.isActive("bold"),
      isItalic: editor.isActive("italic"),
      isUnderline: editor.isActive("underline"),
      isStrike: editor.isActive("strike"),
      isHeading2: editor.isActive("heading", { level: 2 }),
      isHeading3: editor.isActive("heading", { level: 3 }),
      isBulletList: editor.isActive("bulletList"),
      isOrderedList: editor.isActive("orderedList"),
      isBlockquote: editor.isActive("blockquote"),
      isLink: editor.isActive("link"),
    }),
  });

  return (
    <TooltipProvider>
      <div
        role="toolbar"
        aria-label="Formatting"
        className="flex flex-wrap items-center gap-0.5 rounded-md border bg-muted/30 p-1"
      >
        <ToolButton
          label="Bold"
          active={state.isBold}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold />
        </ToolButton>
        <ToolButton
          label="Italic"
          active={state.isItalic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic />
        </ToolButton>
        <ToolButton
          label="Underline"
          active={state.isUnderline}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon />
        </ToolButton>
        <ToolButton
          label="Strikethrough"
          active={state.isStrike}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough />
        </ToolButton>

        {isReview && (
          <>
            <ToolButton
              label="Heading"
              active={state.isHeading2}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              <Heading2 />
            </ToolButton>
            <ToolButton
              label="Subheading"
              active={state.isHeading3}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
              <Heading3 />
            </ToolButton>
            <ToolButton
              label="Bullet list"
              active={state.isBulletList}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List />
            </ToolButton>
            <ToolButton
              label="Numbered list"
              active={state.isOrderedList}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered />
            </ToolButton>
            <ToolButton
              label="Quote"
              active={state.isBlockquote}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <QuoteIcon />
            </ToolButton>
            <ToolButton label="Spoiler" onClick={() => onOpenDialog("spoiler")}>
              <EyeOff />
            </ToolButton>
          </>
        )}

        <ToolButton label="Link" active={state.isLink} onClick={() => onOpenDialog("link")}>
          <Link2 />
        </ToolButton>

        {isReview && (
          <ToolButton label="Insert image" onClick={() => onOpenDialog("image")}>
            <ImagePlus />
          </ToolButton>
        )}
        {isReview && (
          <ToolButton label="Embed video" onClick={() => onOpenDialog("video")}>
            <Clapperboard />
          </ToolButton>
        )}
        <ToolButton label="GIF" onClick={() => onOpenDialog("gif")}>
          <span aria-hidden className="text-[10px] font-bold tracking-tight">
            GIF
          </span>
        </ToolButton>
      </div>
    </TooltipProvider>
  );
}
