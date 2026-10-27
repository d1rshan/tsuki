import { describe, expect, test } from "vitest";

import { getAuthCallback } from "@/features/auth/callback";

describe("auth email callbacks", () => {
  test("opens password reset and removes the token while preserving the page and filters", () => {
    const url = new URL(
      "https://tsuki.fun/?q=naruto&auth=reset-password&token=reset-secret#results",
    );
    expect(getAuthCallback(url)).toEqual({
      state: { mode: "reset-password", token: "reset-secret" },
      cleanUrl: "/?q=naruto#results",
    });
    expect(url.searchParams.get("token")).toBe("reset-secret");
  });

  test("invalid callback links open the unavailable-link state and clear the callback error", () => {
    expect(
      getAuthCallback(
        new URL("https://tsuki.fun/?auth=reset-password&error=INVALID_TOKEN&token=bad"),
      ),
    ).toEqual({
      state: { mode: "reset-password", token: undefined },
      cleanUrl: "/",
    });
  });

  test("a callback without a token opens the unavailable-link state", () => {
    expect(getAuthCallback(new URL("https://tsuki.fun/?auth=reset-password"))?.state).toEqual({
      mode: "reset-password",
      token: undefined,
    });
  });

  test("ordinary URLs do not open auth or consume unrelated token parameters", () => {
    expect(getAuthCallback(new URL("https://tsuki.fun/?token=unrelated"))).toBeNull();
    expect(getAuthCallback(new URL("https://tsuki.fun/?auth=sign-in"))).toBeNull();
  });
});
