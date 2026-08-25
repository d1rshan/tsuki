import { describe, expect, test } from "bun:test";

import { isEmptyRichContent, validateRichContent } from "./validate";
import type { RichContent } from "./types";

/** Shorthand builders keep the matrices readable. */
const text = (value: string, marks?: unknown[]) => ({ type: "text", text: value, marks });
const para = (...inline: unknown[]) => ({ type: "paragraph", content: inline });
const doc = (...blocks: unknown[]): RichContent => ({
  version: 1,
  doc: { type: "doc", content: blocks } as RichContent["doc"],
});
const gif = (src = "https://media.giphy.com/media/x/giphy.gif") => ({
  type: "mediaEmbed",
  attrs: { kind: "gif", src },
});
const image = (src = "https://example.com/a.png", alt = "a picture") => ({
  type: "mediaEmbed",
  attrs: { kind: "image", src, alt },
});
const video = (src = "https://www.youtube.com/watch?v=dQw4w9WgXcQ") => ({
  type: "mediaEmbed",
  attrs: { kind: "video", src },
});

describe("shared structure", () => {
  test("accepts an empty document", () => {
    expect(validateRichContent(doc(), "bio").ok).toBeTrue();
  });

  test("rejects non-documents", () => {
    for (const bad of [null, undefined, 42, "x", {}, { version: 1 }, { doc: {} }]) {
      expect(validateRichContent(bad, "bio").ok).toBeFalse();
    }
  });

  test("rejects unknown versions", () => {
    expect(validateRichContent({ version: 2, doc: { type: "doc" } }, "bio").ok).toBeFalse();
  });

  test("rejects unknown node types and marks", () => {
    expect(validateRichContent(doc({ type: "codeBlock" }), "review").ok).toBeFalse();
    expect(
      validateRichContent(
        doc(para(text("hi", [{ type: "color", attrs: { color: "red" } }]))),
        "bio",
      ).ok,
    ).toBeFalse();
  });

  test("rejects raw text where only blocks belong", () => {
    expect(validateRichContent(doc(text("hi")), "bio").ok).toBeFalse();
  });
});

describe("marks and links", () => {
  test("accepts bold, italic, underline, strikethrough and links", () => {
    const value = doc(
      para(
        text("b", [{ type: "bold" }]),
        text("i", [{ type: "italic" }]),
        text("u", [{ type: "underline" }]),
        text("s", [{ type: "strike" }]),
        text("l", [
          {
            type: "link",
            attrs: {
              href: "https://tsuki.app",
              target: "_blank",
              rel: "noopener noreferrer nofollow",
            },
          },
        ]),
      ),
    );
    expect(validateRichContent(value, "bio").ok).toBeTrue();
  });

  test("rejects insecure or malformed link targets", () => {
    for (const href of [
      "javascript:alert(1)",
      "http://insecure.example", // ponytail: http links rejected alongside https-only media
      "not a url",
      "//protocol-relative.example",
    ]) {
      const value = doc(para(text("x", [{ type: "link", attrs: { href } }])));
      expect(validateRichContent(value, "review").ok).toBeFalse();
    }
  });
});

describe("bio preset", () => {
  test("accepts paragraphs with up to three Giphy embeds", () => {
    const value = doc(para(text("hello")), gif(), gif(), gif());
    expect(validateRichContent(value, "bio").ok).toBeTrue();
  });

  test("rejects review-only blocks", () => {
    for (const block of [
      { type: "heading", attrs: { level: 2 }, content: [text("h")] },
      { type: "bulletList", content: [{ type: "listItem", content: [para(text("x"))] }] },
      { type: "orderedList", content: [{ type: "listItem", content: [para(text("x"))] }] },
      { type: "blockquote", content: [para(text("q"))] },
      { type: "spoiler", attrs: { label: null }, content: [para(text("s"))] },
      image(),
      video(),
    ]) {
      expect(validateRichContent(doc(block), "bio").ok).toBeFalse();
    }
  });

  test("enforces the 500 character and three embed limits", () => {
    expect(validateRichContent(doc(para(text("a".repeat(500)))), "bio").ok).toBeTrue();
    expect(validateRichContent(doc(para(text("a".repeat(501)))), "bio").ok).toBeFalse();
    expect(validateRichContent(doc(gif(), gif(), gif(), gif()), "bio").ok).toBeFalse();
  });

  test("rejects non-Giphy gif sources", () => {
    expect(validateRichContent(doc(gif("https://evil.example/x.gif")), "bio").ok).toBeFalse();
    expect(
      validateRichContent(doc(gif("http://media.giphy.com/media/x/giphy.gif")), "bio").ok,
    ).toBeFalse();
  });
});

describe("review preset", () => {
  test("accepts every permitted node", () => {
    const value = doc(
      { type: "heading", attrs: { level: 2 }, content: [text("Title")] },
      { type: "heading", attrs: { level: 3 }, content: [text("Sub")] },
      para(text("Body ", [{ type: "bold" }])),
      {
        type: "bulletList",
        content: [{ type: "listItem", content: [para(text("point"))] }],
      },
      {
        type: "orderedList",
        content: [{ type: "listItem", content: [para(text("step"))] }],
      },
      { type: "blockquote", content: [para(text("quote"))] },
      { type: "spoiler", attrs: { label: "Episode 12" }, content: [para(text("secret"))] },
      image(),
      video(),
      gif(),
    );
    expect(validateRichContent(value, "review").ok).toBeTrue();
  });

  test("rejects headings outside H2/H3", () => {
    for (const level of [1, 4, 6]) {
      const value = doc({ type: "heading", attrs: { level }, content: [] });
      expect(validateRichContent(value, "review").ok).toBeFalse();
    }
  });

  test("enforces the 10,000 character and ten embed limits", () => {
    expect(validateRichContent(doc(para(text("a".repeat(10_000)))), "review").ok).toBeTrue();
    expect(validateRichContent(doc(para(text("a".repeat(10_001)))), "review").ok).toBeFalse();

    const elevenEmbeds = Array.from({ length: 11 }, () => image());
    expect(validateRichContent(doc(...elevenEmbeds), "review").ok).toBeFalse();
  });

  test("requires alt text on manually inserted images", () => {
    expect(validateRichContent(doc(image()), "review").ok).toBeTrue();
    expect(
      validateRichContent(doc(image("https://example.com/a.png", "  ")), "review").ok,
    ).toBeFalse();
    expect(
      validateRichContent(
        doc({ type: "mediaEmbed", attrs: { kind: "image", src: "https://example.com/a.png" } }),
        "review",
      ).ok,
    ).toBeFalse();
  });

  test("rejects unsupported video providers and accepts approved ones", () => {
    expect(validateRichContent(doc(video("https://vimeo.com/76979871")), "review").ok).toBeTrue();
    expect(validateRichContent(doc(video("https://youtu.be/dQw4w9WgXcQ")), "review").ok).toBeTrue();
    expect(
      validateRichContent(doc(video("https://youtube-nocookie.com/embed/dQw4w9WgXcQ")), "review")
        .ok,
    ).toBeTrue();
    for (const src of [
      "https://dailymotion.com/video/x",
      "https://youtube.com/watch?v=;<script>",
      "https://youtube.evil.example/watch?v=x",
      "ftp://youtube.com/watch?v=x",
    ]) {
      expect(validateRichContent(doc(video(src)), "review").ok).toBeFalse();
    }
  });

  test("normalises video sources to canonical embed URLs", () => {
    const result = validateRichContent(doc(video("https://youtu.be/dQw4w9WgXcQ")), "review");
    if (!result.ok) throw new Error("expected ok");
    const block = result.value.doc.content![0] as { attrs: Record<string, string> };
    expect(block.attrs!.src).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");

    const vimeo = validateRichContent(doc(video("https://vimeo.com/76979871")), "review");
    if (!vimeo.ok) throw new Error("expected ok");
    expect(vimeo.value.doc.content![0].attrs!.src).toBe("https://player.vimeo.com/video/76979871");
  });

  test("rejects spoilers nested in spoilers", () => {
    const value = doc({
      type: "spoiler",
      attrs: {},
      content: [{ type: "spoiler", attrs: {}, content: [para(text("double"))] }],
    });
    expect(validateRichContent(value, "review").ok).toBeFalse();
  });

  test("bounds spoiler labels", () => {
    const value = doc({
      type: "spoiler",
      attrs: { label: "x".repeat(101) },
      content: [para(text("s"))],
    });
    expect(validateRichContent(value, "review").ok).toBeFalse();
  });
});

describe("text alignment", () => {
  const aligned = (align: unknown, type = "paragraph") => ({
    type,
    attrs: { textAlign: align, ...(type === "heading" ? { level: 2 } : {}) },
    content: [text("x")],
  });

  test("accepts every alignment on paragraphs and headings in reviews", () => {
    for (const align of ["left", "center", "right", "justify", null]) {
      expect(validateRichContent(doc(aligned(align)), "review").ok).toBeTrue();
      expect(validateRichContent(doc(aligned(align, "heading")), "review").ok).toBeTrue();
    }
  });

  test("rejects alignment in the bio preset", () => {
    expect(validateRichContent(doc(aligned("center")), "bio").ok).toBeFalse();
  });

  test("rejects bogus alignment values", () => {
    for (const align of ["middle", 42, true, { dir: "rtl" }]) {
      expect(validateRichContent(doc(aligned(align)), "review").ok).toBeFalse();
    }
  });

  test("rejects alignment attributes on non-text blocks", () => {
    const embed = gif();
    embed.attrs = { ...embed.attrs, textAlign: "center" };
    expect(validateRichContent(doc(embed), "review").ok).toBeFalse();
  });
});

describe("isEmptyRichContent", () => {
  test("is true only when there is nothing worth persisting", () => {
    expect(isEmptyRichContent(null)).toBeTrue();
    expect(isEmptyRichContent(doc())).toBeTrue();
    expect(isEmptyRichContent(doc(para(text(""))))).toBeTrue();
    expect(isEmptyRichContent(doc(para(text("hi"))))).toBeFalse();
    expect(isEmptyRichContent(doc(gif()))).toBeFalse();
  });
});
