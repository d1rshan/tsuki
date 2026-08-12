import { Fragment, type ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

const inlinePattern = /(\*\*[^*]+\*\*|_[^_]+_|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g;

function inlineContent(content: string) {
  return content.split(inlinePattern).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("_") && part.endsWith("_")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index} className="rounded bg-muted px-1 py-0.5 text-[0.9em] text-foreground">
          {part.slice(1, -1)}
        </code>
      );
    }

    const link = /^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/.exec(part);
    if (link) {
      return (
        <a
          key={index}
          href={link[2]}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
        >
          {link[1]}
        </a>
      );
    }

    return <Fragment key={index}>{part}</Fragment>;
  });
}

export function ReviewContent({ className, content }: { className?: string; content: string }) {
  const blocks: ReactNode[] = [];
  const lines = content.split("\n");

  for (let index = 0; index < lines.length; ) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      const Heading = `h${heading[1].length}` as "h1" | "h2" | "h3";
      blocks.push(
        <Heading key={index} className="font-semibold tracking-tight text-foreground">
          {inlineContent(heading[2])}
        </Heading>,
      );
      index += 1;
      continue;
    }

    if (line.startsWith("> ")) {
      blocks.push(
        <blockquote
          key={index}
          className="border-l-2 border-primary/50 pl-3 italic text-foreground/80"
        >
          {inlineContent(line.slice(2))}
        </blockquote>,
      );
      index += 1;
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];
      const key = index;
      while (lines[index]?.startsWith("- ")) {
        items.push(lines[index].slice(2));
        index += 1;
      }
      blocks.push(
        <ul key={key} className="list-disc pl-5">
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{inlineContent(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    const paragraph: string[] = [];
    const key = index;
    while (
      lines[index] &&
      !/^#{1,3}\s+/.test(lines[index]) &&
      !lines[index].startsWith("> ") &&
      !lines[index].startsWith("- ")
    ) {
      paragraph.push(lines[index]);
      index += 1;
    }
    blocks.push(
      <p key={key} className="whitespace-pre-wrap text-foreground/90">
        {inlineContent(paragraph.join("\n"))}
      </p>,
    );
  }

  return <div className={cn("flex flex-col gap-4", className)}>{blocks}</div>;
}
