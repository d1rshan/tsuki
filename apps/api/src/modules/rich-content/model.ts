import { t } from "elysia";

/**
 * Transport-level shape of a Rich Content document. Deep policy checks
 * (presets, URL rules, limits) run in `validateRichContent` from
 * `@tsuki/rich-content` before anything is persisted — this model only pins
 * the envelope for OpenAPI and the Eden client types.
 */
export const RichContentModel = t.Object({
  version: t.Literal(1),
  doc: t.Object({
    type: t.Literal("doc"),
    content: t.Optional(t.Array(t.Unknown())),
  }),
});
