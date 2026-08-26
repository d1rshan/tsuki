import { describe, expect, test } from "bun:test";

import { renderRichContent } from "./render";
import type { RichContent } from "./types";

const text = (value: string, marks?: unknown[]) => ({ type: "text", text: value, marks });
const para = (...inline: unknown[]) => ({ type: "paragraph", content: inline });
const doc = (...blocks: unknown[]): RichContent => ({
  version: 1,
  doc: { type: "doc", content: blocks } as RichContent["doc"],
});

function render(...blocks: unknown[]) {
  return renderRichContent(doc(...blocks));
}

describe("renderRichContent", () => {
  test("renders formatted text with semantic elements", () => {
    const html = render(
      para(
        text("bold", [{ type: "bold" }]),
        text("italic", [{ type: "italic" }]),
        text("under", [{ type: "underline" }]),
        text("struck", [{ type: "strike" }]),
      ),
    );
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<em>italic</em>");
    expect(html).toContain("<u>under</u>");
    expect(html).toContain("<s>struck</s>");
  });

  test("renders links that do not open in the same context", () => {
    const html = render(
      para(text("here", [{ type: "link", attrs: { href: "https://tsuki.app" } }])),
    );
    expect(html).toContain('href="https://tsuki.app"');
    expect(html).toContain('rel="noopener noreferrer nofollow"');
  });

  test("keeps Heading/Subheading on an H2/H3 hierarchy", () => {
    const html = render(
      { type: "heading", attrs: { level: 2 }, content: [text("Title")] },
      { type: "heading", attrs: { level: 3 }, content: [text("Sub")] },
    );
    expect(html).toContain("<h2>Title</h2>");
    expect(html).toContain("<h3>Sub</h3>");
    expect(html).not.toContain("<h1");
  });

  test("renders lists and quotes", () => {
    const html = render(
      { type: "bulletList", content: [{ type: "listItem", content: [para(text("a"))] }] },
      { type: "orderedList", content: [{ type: "listItem", content: [para(text("b"))] }] },
      { type: "blockquote", content: [para(text("q"))] },
    );
    expect(html).toContain("<ul>");
    expect(html).toContain("<ol>");
    expect(html).toContain("<blockquote>");
  });

  test("renders spoilers concealed behind a labelled overlay hook", () => {
    const html = render({
      type: "spoiler",
      attrs: { label: "Episode 12" },
      content: [para(text("secret"))],
    });
    expect(html).toContain("data-spoiler");
    expect(html).toMatch(/data-label="Episode 12"/);
    expect(html).toContain('tabindex="0"');
  });

  test("renders images with author-supplied alt text and lazy loading", () => {
    const html = render({
      type: "mediaEmbed",
      attrs: { kind: "image", src: "https://example.com/a.png", alt: "a picture" },
    });
    expect(html).toContain('<img src="https://example.com/a.png" alt="a picture" loading="lazy"');
  });

  test("renders approved videos as responsive iframes", () => {
    const html = render({
      type: "mediaEmbed",
      attrs: {
        kind: "video",
        src: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
        alt: null,
      },
    });
    expect(html).toContain("<iframe");
    expect(html).toContain('src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"');
    expect(html).toContain("allowfullscreen");
  });

  test("marks Giphy embeds for attribution styling", () => {
    const html = render({
      type: "mediaEmbed",
      attrs: { kind: "gif", src: "https://media.giphy.com/media/x/giphy.gif", alt: null },
    });
    expect(html).toContain("data-giphy");
    expect(html).toContain('alt="GIF"');
  });

  test("exposes full and compact presentation modes", () => {
    const full = renderRichContent(doc(para(text("hi"))), "full");
    const compact = renderRichContent(doc(para(text("hi"))), "compact");
    expect(full).toContain("rich-content--full");
    expect(compact).toContain("rich-content--compact");
  });

  test("renders nothing for empty or invalid documents", () => {
    expect(renderRichContent(null)).toBe("");
    expect(renderRichContent(undefined)).toBe("");
    expect(renderRichContent({ version: 7, doc: { type: "doc" } } as never)).toBe("");
    expect(
      renderRichContent(
        doc({ type: "spoiler", attrs: {}, content: [para(text("s"))] }) as never,
        "full",
        // A bio-preset document may not contain spoilers — but it still renders
        // because the renderer does not re-run per-preset policy.
      ).length,
    ).toBeGreaterThan(0);
  });
});
