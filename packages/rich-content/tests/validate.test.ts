import { describe, expect, test } from "vitest";

import { isEmptyRichContent, isValidForAnyPreset, validateRichContent } from "../src/validate";
import type { RichContent } from "../src/types";

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
    expect(validateRichContent(doc(), "bio").ok).toBe(true);
  });

  test("rejects non-documents", () => {
    for (const bad of [null, undefined, 42, "x", {}, { version: 1 }, { doc: {} }]) {
      expect(validateRichContent(bad, "bio").ok).toBe(false);
    }
  });

  test("rejects unknown versions", () => {
    expect(validateRichContent({ version: 2, doc: { type: "doc" } }, "bio").ok).toBe(false);
  });

  test("rejects unknown node types and marks", () => {
    expect(validateRichContent(doc({ type: "codeBlock" }), "review").ok).toBe(false);
    expect(
      validateRichContent(
        doc(para(text("hi", [{ type: "color", attrs: { color: "red" } }]))),
        "bio",
      ).ok,
    ).toBe(false);
  });

  test("rejects raw text where only blocks belong", () => {
    expect(validateRichContent(doc(text("hi")), "bio").ok).toBe(false);
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
    expect(validateRichContent(value, "bio").ok).toBe(true);
  });

  test("accepts Tiptap v3 link marks with null attribute defaults", () => {
    const value = doc(
      para(
        text("l", [
          {
            type: "link",
            attrs: {
              href: "https://tsuki.app",
              target: "_blank",
              rel: "noopener noreferrer nofollow",
              class: null,
              title: null,
            },
          },
        ]),
      ),
    );
    expect(validateRichContent(value, "review").ok).toBe(true);
  });

  test("rejects insecure or malformed link targets", () => {
    for (const href of [
      "javascript:alert(1)",
      "http://insecure.example", // ponytail: http links rejected alongside https-only media
      "not a url",
      "//protocol-relative.example",
    ]) {
      const value = doc(para(text("x", [{ type: "link", attrs: { href } }])));
      expect(validateRichContent(value, "review").ok).toBe(false);
    }
  });

  test("pins link target and rel to the safe renderer defaults", () => {
    const link = (attrs: Record<string, unknown>) =>
      doc(para(text("x", [{ type: "link", attrs: { href: "https://tsuki.app", ...attrs } }])));

    expect(
      validateRichContent(link({ target: "_blank", rel: "noopener noreferrer nofollow" }), "bio")
        .ok,
    ).toBe(true);
    expect(validateRichContent(link({ target: null, rel: null }), "bio").ok).toBe(true);

    for (const hostile of [
      { target: "_top" },
      { target: "_self" },
      { rel: "opener" },
      { rel: "noopener" },
      { class: "evil-component" },
    ]) {
      expect(validateRichContent(link(hostile), "review").ok).toBe(false);
    }
  });
});

describe("bio preset", () => {
  test("accepts paragraphs with up to three Giphy embeds", () => {
    const value = doc(para(text("hello")), gif(), gif(), gif());
    expect(validateRichContent(value, "bio").ok).toBe(true);
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
      expect(validateRichContent(doc(block), "bio").ok).toBe(false);
    }
  });

  test("enforces the 500 character and three embed limits", () => {
    expect(validateRichContent(doc(para(text("a".repeat(500)))), "bio").ok).toBe(true);
    expect(validateRichContent(doc(para(text("a".repeat(501)))), "bio").ok).toBe(false);
    expect(validateRichContent(doc(gif(), gif(), gif(), gif()), "bio").ok).toBe(false);
  });

  test("rejects non-Giphy gif sources", () => {
    expect(validateRichContent(doc(gif("https://evil.example/x.gif")), "bio").ok).toBe(false);
    expect(
      validateRichContent(doc(gif("http://media.giphy.com/media/x/giphy.gif")), "bio").ok,
    ).toBe(false);
  });

  test("rejects media alignment (review-only capability)", () => {
    const aligned = { ...gif(), attrs: { ...gif().attrs, textAlign: "center" } };
    expect(validateRichContent(doc(aligned), "bio").ok).toBe(false);
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
    expect(validateRichContent(value, "review").ok).toBe(true);
  });

  test("rejects headings outside H2/H3", () => {
    for (const level of [1, 4, 6]) {
      const value = doc({ type: "heading", attrs: { level }, content: [] });
      expect(validateRichContent(value, "review").ok).toBe(false);
    }
  });

  test("enforces the 10,000 character and ten embed limits", () => {
    expect(validateRichContent(doc(para(text("a".repeat(10_000)))), "review").ok).toBe(true);
    expect(validateRichContent(doc(para(text("a".repeat(10_001)))), "review").ok).toBe(false);

    const elevenEmbeds = Array.from({ length: 11 }, () => image());
    expect(validateRichContent(doc(...elevenEmbeds), "review").ok).toBe(false);
  });

  test("requires alt text on manually inserted images", () => {
    expect(validateRichContent(doc(image()), "review").ok).toBe(true);
    expect(validateRichContent(doc(image("https://example.com/a.png", "  ")), "review").ok).toBe(
      false,
    );
    expect(
      validateRichContent(
        doc({ type: "mediaEmbed", attrs: { kind: "image", src: "https://example.com/a.png" } }),
        "review",
      ).ok,
    ).toBe(false);
  });

  test("accepts whitelisted media alignment and rejects the rest", () => {
    for (const align of ["center", "right", "justify", "left"]) {
      const aligned = { ...gif(), attrs: { ...gif().attrs, textAlign: align } };
      expect(validateRichContent(doc(aligned), "review").ok).toBe(true);
    }
    for (const align of ["middle", "start", ""]) {
      const aligned = { ...gif(), attrs: { ...gif().attrs, textAlign: align } };
      expect(validateRichContent(doc(aligned), "review").ok).toBe(false);
    }
  });

  test("rejects unsupported video providers and accepts approved ones", () => {
    expect(validateRichContent(doc(video("https://vimeo.com/76979871")), "review").ok).toBe(true);
    expect(validateRichContent(doc(video("https://youtu.be/dQw4w9WgXcQ")), "review").ok).toBe(true);
    expect(
      validateRichContent(doc(video("https://youtube-nocookie.com/embed/dQw4w9WgXcQ")), "review")
        .ok,
    ).toBe(true);
    for (const src of [
      "https://dailymotion.com/video/x",
      "https://youtube.com/watch?v=;<script>",
      "https://youtube.evil.example/watch?v=x",
      "ftp://youtube.com/watch?v=x",
    ]) {
      expect(validateRichContent(doc(video(src)), "review").ok).toBe(false);
    }
  });

  test("normalises video sources to canonical embed URLs", () => {
    const result = validateRichContent(doc(video("https://youtu.be/dQw4w9WgXcQ")), "review");
    if (!result.ok) throw new Error("expected ok");
    const block = result.value.doc.content![0] as { attrs: Record<string, string> };
    expect(block.attrs!.src).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");

    const vimeo = validateRichContent(doc(video("https://vimeo.com/76979871")), "review");
    if (!vimeo.ok) throw new Error("expected ok");
    expect((vimeo.value.doc.content![0] as { attrs: Record<string, string> }).attrs.src).toBe(
      "https://player.vimeo.com/video/76979871",
    );
  });

  test("rejects spoilers nested in spoilers", () => {
    const value = doc({
      type: "spoiler",
      attrs: {},
      content: [{ type: "spoiler", attrs: {}, content: [para(text("double"))] }],
    });
    expect(validateRichContent(value, "review").ok).toBe(false);
  });

  test("bounds spoiler labels", () => {
    const value = doc({
      type: "spoiler",
      attrs: { label: "x".repeat(101) },
      content: [para(text("s"))],
    });
    expect(validateRichContent(value, "review").ok).toBe(false);
  });
});

describe("lists", () => {
  const list = (type: string, attrs?: unknown, content?: unknown) => ({
    type,
    ...(attrs === undefined ? {} : { attrs }),
    content: content ?? [{ type: "listItem", content: [para(text("x"))] }],
  });

  test("accepts v3 orderedList default attrs and custom numbering", () => {
    // Tiptap always serializes {start, type} even at their defaults.
    expect(
      validateRichContent(doc(list("orderedList", { start: 1, type: null })), "review").ok,
    ).toBe(true);
    expect(
      validateRichContent(doc(list("orderedList", { start: 5, type: "a" })), "review").ok,
    ).toBe(true);
  });

  test("rejects out-of-range or hostile orderedList attrs", () => {
    for (const attrs of [
      { start: 0 },
      { start: -1 },
      { start: 1.5 },
      { start: "1" },
      { type: "<script>" },
      { start: 1, evil: true },
    ]) {
      expect(validateRichContent(doc(list("orderedList", attrs)), "review").ok).toBe(false);
    }
  });

  test("still rejects bulletLists carrying attrs", () => {
    expect(validateRichContent(doc(list("bulletList")), "review").ok).toBe(true);
    expect(validateRichContent(doc(list("bulletList", { tight: true })), "review").ok).toBe(false);
  });

  test("accepts nested lists from Tab-indenting list items", () => {
    const value = doc(
      list("bulletList", undefined, [
        {
          type: "listItem",
          content: [
            para(text("outer")),
            list("bulletList", undefined, [{ type: "listItem", content: [para(text("inner"))] }]),
          ],
        },
      ]),
    );
    expect(validateRichContent(value, "review").ok).toBe(true);
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
      expect(validateRichContent(doc(aligned(align)), "review").ok).toBe(true);
      expect(validateRichContent(doc(aligned(align, "heading")), "review").ok).toBe(true);
    }
  });

  test("rejects alignment in the bio preset", () => {
    expect(validateRichContent(doc(aligned("center")), "bio").ok).toBe(false);
  });

  test("rejects bogus alignment values", () => {
    for (const align of ["middle", 42, true, { dir: "rtl" }]) {
      expect(validateRichContent(doc(aligned(align)), "review").ok).toBe(false);
    }
  });

  test("rejects alignment attributes on blocks that cannot take them", () => {
    const quoted = {
      type: "blockquote",
      attrs: { textAlign: "center" },
      content: [para(text("x"))],
    };
    expect(validateRichContent(doc(quoted), "review").ok).toBe(false);
  });
});

describe("isEmptyRichContent", () => {
  test("is true only when there is nothing worth persisting", () => {
    expect(isEmptyRichContent(null)).toBe(true);
    expect(isEmptyRichContent(doc())).toBe(true);
    expect(isEmptyRichContent(doc(para(text(""))))).toBe(true);
    expect(isEmptyRichContent(doc(para(text("hi"))))).toBe(false);
    expect(isEmptyRichContent(doc(gif()))).toBe(false);
  });
});

describe("structural bounds", () => {
  const nestedLists = (depth: number): unknown => {
    let node: unknown = para(text("deep"));
    for (let i = 0; i < depth; i++) {
      // Tab-indenting keeps the item's own paragraph beside the nested list.
      node = {
        type: "bulletList",
        content: [{ type: "listItem", content: [para(text(`level ${i}`)), node] }],
      };
    }
    return node;
  };

  test("accepts nesting far beyond what the editor can author", () => {
    expect(validateRichContent(doc(nestedLists(6)), "review").ok).toBe(true);
  });

  test("rejects pathological nesting before recursion gets deep", () => {
    expect(validateRichContent(doc(nestedLists(12)), "review").ok).toBe(false);
  });
});

describe("purity", () => {
  test("does not mutate the caller's document", () => {
    const value = doc(video("https://youtu.be/dQw4w9WgXcQ"));
    const result = validateRichContent(value, "review");
    expect(result.ok).toBe(true);

    // The canonical URL lands in the returned copy, not the input.
    if (!result.ok) throw new Error("expected ok");
    const saved = result.value.doc.content![0] as { attrs: Record<string, string> };
    expect(saved.attrs.src).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
    const original = value.doc.content![0] as { attrs: Record<string, string> };
    expect(original.attrs.src).toBe("https://youtu.be/dQw4w9WgXcQ");
  });
});

describe("isValidForAnyPreset", () => {
  test("accepts documents matching any single preset and rejects the rest", () => {
    expect(isValidForAnyPreset(doc(para(text("hello"))))).toBe(true);
    expect(isValidForAnyPreset(doc(gif()))).toBe(true);
    expect(
      isValidForAnyPreset(doc({ type: "heading", attrs: { level: 2 }, content: [text("T")] })),
    ).toBe(true);

    expect(isValidForAnyPreset(null)).toBe(false);
    expect(isValidForAnyPreset({ type: "codeBlock" })).toBe(false);
  });
});
