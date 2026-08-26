import { Node, mergeAttributes } from "@tiptap/core";
import TextAlign from "@tiptap/extension-text-align";
import StarterKit from "@tiptap/starter-kit";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    spoiler: {
      /** Toggles the selection (or an empty block) into a Spoiler. */
      toggleSpoiler: () => ReturnType;
    };
  }
}

/**
 * A concealed block of Rich Content. The optional label tells readers what
 * they are choosing to reveal. Rendered as a `div[data-spoiler]` that the
 * display layer obscures until an accessible tap/click.
 */
export const Spoiler = Node.create({
  name: "spoiler",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      label: {
        default: null,
        parseHTML: () => null,
        renderHTML: (attributes) =>
          attributes.label ? { "data-label": String(attributes.label) } : {},
      },
    };
  },

  // No parseHTML: spoilers are insert-only, so pasted HTML can never smuggle one in.
  renderHTML({ node }) {
    const label = typeof node.attrs.label === "string" && node.attrs.label.trim();
    return [
      "div",
      mergeAttributes({
        "data-spoiler": "",
        "data-label": label || "Spoiler",
        tabindex: "0",
        role: "button",
        "aria-expanded": "false",
        "aria-label": `Spoiler${label ? `: ${label}` : ""}`,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      toggleSpoiler:
        () =>
        ({ commands }) =>
          commands.toggleWrap(this.name),
    };
  },
});

/**
 * An externally hosted image, video, or Giphy GIF, inserted by URL through an
 * insertion dialog. No local uploads and no arbitrary iframes: the API
 * validates providers before anything here is ever persisted.
 */
export const MediaEmbed = Node.create({
  name: "mediaEmbed",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      kind: { default: null },
      src: { default: null },
      alt: { default: null },
    };
  },

  // No parseHTML (insert-only): pasted images/iframes are dropped rather than imported.
  // Alignment maps textAlign to auto margins: images are block-level (Tailwind
  // preflight), so text-align can't move them; margins do. Justify is a no-op
  // for a single block and renders as left.
  renderHTML({ node }) {
    const { kind, src, alt } = node.attrs as { kind: string; src: string; alt: string | null };
    const align = node.attrs.textAlign as string | null;
    const alignStyle =
      align === "center"
        ? { style: "margin-inline: auto" }
        : align === "right"
          ? { style: "margin-left: auto" }
          : {};

    if (kind === "video") {
      return [
        "div",
        { "data-video": "" },
        [
          "iframe",
          {
            src,
            title: alt || "Embedded video",
            allowfullscreen: "true",
            allow:
              "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
            referrerpolicy: "strict-origin-when-cross-origin",
            frameborder: "0",
            loading: "lazy",
          },
        ],
      ];
    }

    return [
      "img",
      mergeAttributes(
        {
          src,
          alt: alt || (kind === "gif" ? "GIF" : ""),
          loading: "lazy",
          draggable: "false",
        },
        kind === "gif" ? { "data-giphy": "" } : {},
        alignStyle,
      ),
    ];
  },
});

/** The single extension set shared by the editor and the static renderer. */
export function richContentExtensions(options?: { undoRedo?: boolean }) {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      // V1 exclusions — the validator rejects them even if they slip into a doc.
      code: false,
      codeBlock: false,
      horizontalRule: false,
      link: {
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
      },
      undoRedo: options?.undoRedo === false ? false : undefined,
    }),
    TextAlign.configure({ types: ["paragraph", "heading", "mediaEmbed"] }),
    Spoiler,
    MediaEmbed,
  ];
}

/** Preset → toolbar capability mapping lives with the editor in apps/web. */
