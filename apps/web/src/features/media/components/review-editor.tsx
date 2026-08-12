"use client";

import { useId } from "react";
import MDEditor, {
  bold,
  code,
  codeEdit,
  codePreview,
  divider,
  italic,
  link,
  orderedListCommand,
  quote,
  strikethrough,
  unorderedListCommand,
} from "@uiw/react-md-editor/nohighlight";
import { defaultUrlTransform } from "react-markdown";

import { Label } from "@/components/ui/label";

type ReviewEditorProps = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

const commands = [
  bold,
  italic,
  strikethrough,
  divider,
  link,
  quote,
  code,
  divider,
  unorderedListCommand,
  orderedListCommand,
];

export function ReviewEditor({ placeholder, value, onChange }: ReviewEditorProps) {
  const editorId = useId();
  const hintId = useId();

  return (
    <div className="grid gap-2">
      <Label htmlFor={editorId}>Review</Label>
      <p id={hintId} className="text-xs text-muted-foreground">
        Write in Markdown. Use the toolbar or keyboard shortcuts, then preview before saving.
      </p>
      <MDEditor
        value={value}
        onChange={(nextValue) => onChange(nextValue ?? "")}
        height={180}
        preview="edit"
        commands={commands}
        extraCommands={[codeEdit, codePreview]}
        visibleDragbar={false}
        highlightEnable={false}
        textareaProps={{
          id: editorId,
          placeholder,
          "aria-describedby": hintId,
          spellCheck: true,
        }}
        previewOptions={{
          skipHtml: true,
          components: { img: () => null },
          urlTransform: defaultUrlTransform,
        }}
        className="rounded-lg [--color-accent-fg:var(--primary)] [--color-border-default:var(--border)] [--color-canvas-default:var(--background)] [--color-fg-default:var(--foreground)] [--color-neutral-muted:var(--muted)]"
      />
    </div>
  );
}
