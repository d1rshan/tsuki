"use client";

import { useId, useRef, type KeyboardEvent } from "react";
import { Bold, Heading2, Italic, Link, List, Quote } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { ReviewContent } from "./review-content";

const tools = [
  { icon: Bold, label: "Bold", prefix: "**", suffix: "**", placeholder: "bold text" },
  { icon: Italic, label: "Italic", prefix: "_", suffix: "_", placeholder: "italic text" },
  { icon: Link, label: "Link", prefix: "[", suffix: "](https://)", placeholder: "link text" },
] as const;

export function ReviewEditor({
  content,
  id,
  placeholder,
  onChange,
}: {
  content: string;
  id: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const descriptionId = useId();

  function replaceSelection(prefix: string, suffix: string, placeholderText: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionEnd, selectionStart } = textarea;
    const selected = content.slice(selectionStart, selectionEnd) || placeholderText;
    onChange(
      `${content.slice(0, selectionStart)}${prefix}${selected}${suffix}${content.slice(selectionEnd)}`,
    );

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(
        selectionStart + prefix.length,
        selectionStart + prefix.length + selected.length,
      );
    });
  }

  function prefixLines(prefix: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = content.lastIndexOf("\n", textarea.selectionStart - 1) + 1;
    const end = content.indexOf("\n", textarea.selectionEnd);
    const selected = content.slice(start, end === -1 ? content.length : end);
    const replacement = selected
      .split("\n")
      .map((line) => `${prefix}${line}`)
      .join("\n");
    onChange(
      `${content.slice(0, start)}${replacement}${content.slice(end === -1 ? content.length : end)}`,
    );

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + replacement.length);
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (!event.metaKey && !event.ctrlKey) return;
    if (event.key.toLowerCase() === "b") {
      event.preventDefault();
      replaceSelection("**", "**", "bold text");
    }
    if (event.key.toLowerCase() === "i") {
      event.preventDefault();
      replaceSelection("_", "_", "italic text");
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-input bg-background focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
      <div
        role="toolbar"
        aria-label="Review formatting"
        className="flex items-center gap-0.5 border-b border-input bg-muted/30 p-1"
      >
        {tools.map(({ icon: Icon, label, prefix, suffix, placeholder: placeholderText }) => (
          <Button
            key={label}
            type="button"
            variant="ghost"
            size="icon-xs"
            title={label}
            aria-label={label}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => replaceSelection(prefix, suffix, placeholderText)}
          >
            <Icon />
          </Button>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          title="Heading"
          aria-label="Heading"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => prefixLines("## ")}
        >
          <Heading2 />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          title="Quote"
          aria-label="Quote"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => prefixLines("> ")}
        >
          <Quote />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          title="Bulleted list"
          aria-label="Bulleted list"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => prefixLines("- ")}
        >
          <List />
        </Button>
        <span id={descriptionId} className="ml-auto pr-2 text-xs text-muted-foreground">
          Markdown supported
        </span>
      </div>
      <Textarea
        ref={textareaRef}
        id={id}
        aria-describedby={descriptionId}
        placeholder={placeholder}
        value={content}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={6}
        className="min-h-36 resize-y rounded-none border-0 focus-visible:border-0 focus-visible:ring-0"
      />
      {content.trim() ? (
        <div className="border-t border-input bg-muted/20 px-3 py-2">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Preview</p>
          <ReviewContent className="text-sm leading-relaxed" content={content} />
        </div>
      ) : null}
    </div>
  );
}
