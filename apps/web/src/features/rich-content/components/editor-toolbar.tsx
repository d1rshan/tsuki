"use client";

import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";
import type { ReactNode } from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
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

import type { RichContentPresetName } from "@tsuki/rich-content";

import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

import type { InsertKind } from "./rich-content-editor";

type Chain = ReturnType<Editor["chain"]>;

type ToolDef = {
  label: string;
  icon: ReactNode;
  active?: boolean;
  onClick: () => void;
};

function ToolButton({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            aria-pressed={active}
            className={active ? "bg-primary/10 text-primary" : undefined}
            onClick={onClick}
          >
            {icon}
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
  preset: RichContentPresetName;
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
      isAlignCenter: editor.isActive({ textAlign: "center" }),
      isAlignRight: editor.isActive({ textAlign: "right" }),
      isAlignJustify: editor.isActive({ textAlign: "justify" }),
    }),
  });

  // Turns a chain step into a click handler so fresh state is used per click.
  const run = (step: (chain: Chain) => { run(): void }) => () => {
    step(editor.chain().focus()).run();
  };

  const tools: ToolDef[] = [
    { label: "Bold", icon: <Bold />, active: state.isBold, onClick: run((c) => c.toggleBold()) },
    {
      label: "Italic",
      icon: <Italic />,
      active: state.isItalic,
      onClick: run((c) => c.toggleItalic()),
    },
    {
      label: "Underline",
      icon: <UnderlineIcon />,
      active: state.isUnderline,
      onClick: run((c) => c.toggleUnderline()),
    },
    {
      label: "Strikethrough",
      icon: <Strikethrough />,
      active: state.isStrike,
      onClick: run((c) => c.toggleStrike()),
    },

    ...(isReview
      ? [
          {
            label: "Heading",
            icon: <Heading2 />,
            active: state.isHeading2,
            onClick: run((c) => c.toggleHeading({ level: 2 })),
          },
          {
            label: "Subheading",
            icon: <Heading3 />,
            active: state.isHeading3,
            onClick: run((c) => c.toggleHeading({ level: 3 })),
          },
          {
            label: "Bullet list",
            icon: <List />,
            active: state.isBulletList,
            onClick: run((c) => c.toggleBulletList()),
          },
          {
            label: "Numbered list",
            icon: <ListOrdered />,
            active: state.isOrderedList,
            onClick: run((c) => c.toggleOrderedList()),
          },
          {
            label: "Quote",
            icon: <QuoteIcon />,
            active: state.isBlockquote,
            onClick: run((c) => c.toggleBlockquote()),
          },
          { label: "Spoiler", icon: <EyeOff />, onClick: () => onOpenDialog("spoiler") },
          {
            label: "Align left",
            icon: <AlignLeft />,
            active: !(state.isAlignCenter || state.isAlignRight || state.isAlignJustify),
            onClick: run((c) => c.unsetTextAlign()),
          },
          {
            label: "Align center",
            icon: <AlignCenter />,
            active: state.isAlignCenter,
            onClick: run((c) => c.setTextAlign("center")),
          },
          {
            label: "Align right",
            icon: <AlignRight />,
            active: state.isAlignRight,
            onClick: run((c) => c.setTextAlign("right")),
          },
          {
            label: "Align justify",
            icon: <AlignJustify />,
            active: state.isAlignJustify,
            onClick: run((c) => c.setTextAlign("justify")),
          },
        ]
      : []),

    { label: "Link", icon: <Link2 />, active: state.isLink, onClick: () => onOpenDialog("link") },

    ...(isReview
      ? [
          { label: "Insert image", icon: <ImagePlus />, onClick: () => onOpenDialog("image") },
          { label: "Embed video", icon: <Clapperboard />, onClick: () => onOpenDialog("video") },
        ]
      : []),

    {
      label: "GIF",
      icon: (
        <span aria-hidden className="text-[10px] font-bold tracking-tight">
          GIF
        </span>
      ),
      onClick: () => onOpenDialog("gif"),
    },
  ];

  return (
    <TooltipProvider>
      <div
        role="toolbar"
        aria-label="Formatting"
        className="flex flex-wrap items-center gap-0.5 rounded-md border bg-muted/30 p-1"
      >
        {tools.map((tool) => (
          <ToolButton key={tool.label} {...tool} />
        ))}
      </div>
    </TooltipProvider>
  );
}
