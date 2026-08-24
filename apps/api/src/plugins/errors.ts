import { Elysia, ElysiaCustomStatusResponse, t, status } from "elysia";

import { AnilistError } from "@tsuki/anilist";

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
  .error({ ANILIST: AnilistError })
  .onError({ as: "global" }, ({ code, error, request }) => {
    // A thrown `status()` is a deliberate short-circuit from deep in a module;
    // pass its status and body through untouched.
    if (error instanceof ElysiaCustomStatusResponse) {
      return status(error.code, error.response);
    }

    // Elysia's untouched 422 already matches the shape it puts on the route type.
    if (code === "VALIDATION") return;

    // AniList is down or throttling us. Their outage, not our bug.
    if (code === "ANILIST") return status(502, { error: "Upstream service unavailable" });

    // NOT_FOUND, PARSE and the rest each carry the status they mean.
    if ("status" in error && typeof error.status === "number") {
      return status(error.status, { error: error.message });
    }

    console.error(`${request.method} ${new URL(request.url).pathname}`, error);
    return status(500, { error: "An unexpected internal server error occurred" });
  });
