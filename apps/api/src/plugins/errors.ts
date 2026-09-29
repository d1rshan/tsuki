import { Elysia, ElysiaCustomStatusResponse, t, status } from "elysia";

import { KitsuError } from "@tsuki/kitsu";

export const ErrorModel = t.Object({
  error: t.String(),
});

/**
 * The floor under every route. Only *thrown* errors land here — a returned
 * `status()` is part of a route's declared contract and never reaches this.
 *
 * Scoped globally so it covers routes registered on the root instance, not just
 * this plugin's own descendants.
 */
export const errorsPlugin = new Elysia({ name: "errors" })
  .error({ KITSU: KitsuError })
  .onError({ as: "global" }, ({ code, error, request }) => {
    // A thrown `status()` is a deliberate short-circuit from deep in a module;
    // pass its status and body through untouched.
    if (error instanceof ElysiaCustomStatusResponse) {
      return status(error.code, error.response);
    }

    // Elysia's untouched 422 already matches the shape it puts on the route type.
    if (code === "VALIDATION") return;

    // Kitsu is down or throttling us — the sync tick surfaces it as a
    // resumable failure. Their outage, not our bug.
    if (code === "KITSU") return status(502, { error: "Upstream service unavailable" });

    // NOT_FOUND, PARSE and the rest each carry the status they mean.
    if ("status" in error && typeof error.status === "number") {
      return status(error.status, { error: error.message });
    }

    console.error(`${request.method} ${new URL(request.url).pathname}`, error);
    return status(500, { error: "An unexpected internal server error occurred" });
  });
