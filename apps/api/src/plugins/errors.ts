import { Elysia, t } from "elysia";

export const ErrorModel = t.Object({
  error: t.String(),
});

/**
 * Scoped globally so it covers routes registered on the root instance, not just
 * this plugin's own descendants.
 */
export const errorsPlugin = new Elysia({ name: "errors" }).onError(
  { as: "global" },
  ({ code, error, set }) => {
    if (code === "VALIDATION") {
      set.status = 400;
      return { error: "Validation failed", details: error.all };
    }

    if (code === "NOT_FOUND") {
      set.status = 404;
      return { error: "Not found" };
    }

    console.error("Unhandled error:", error);
    set.status = 500;
    return { error: "An unexpected internal server error occurred" };
  },
);
