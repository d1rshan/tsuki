import { Editor } from "@tiptap/core";
import { expect, test } from "vitest";

import { richContentExtensions } from "../src/extensions";

test.each(["toggleBulletList", "toggleBlockquote"] as const)(
  "%s works with the installed ProseMirror packages",
  (command) => {
    const editor = new Editor({
      element: null,
      extensions: richContentExtensions(),
      content: {
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text: "hello world" }] }],
      },
    });

    try {
      expect(editor.commands[command]()).toBe(true);
      expect(editor.getJSON().content?.[0]?.type).toBe(
        command === "toggleBulletList" ? "bulletList" : "blockquote",
      );
    } finally {
      editor.destroy();
    }
  },
);
