import { describe, expect, test } from "bun:test";

import {
  clampProgress,
  createActivityForm,
  createFavoriteInput,
  createLogMediaInput,
  saveMediaActivity,
  type ActivityForm,
} from "./activity";

const form: ActivityForm = {
  containsSpoilers: false,
  progress: "14",
  reviewContent: "",
  score: 8,
  status: "CURRENT",
};

describe("media activity normalization", () => {
  test("starts new logs at zero progress", () => {
    expect(createActivityForm("ANIME", null, null).progress).toBe("0");
  });

  test("clamps progress to a known total", () => {
    expect(clampProgress(14, 12)).toBe(12);
    expect(clampProgress(-2, 12)).toBe(0);
    expect(clampProgress(Number.NaN)).toBe(0);
  });

  test("creates an API input from form state", () => {
    expect(createLogMediaInput(form, true, 12)).toEqual({
      status: "CURRENT",
      score: 8,
      progress: 12,
      isFavorite: true,
    });
  });

  test("turns an unrated form into a null score", () => {
    expect(createLogMediaInput({ ...form, score: 0 }, false).score).toBeNull();
  });

  test("gives status-less favorites a visible planning status", () => {
    expect(createFavoriteInput("ANIME", null, true)).toEqual({
      isFavorite: true,
      status: "PLANNING",
    });
    expect(createFavoriteInput("MANGA", "CURRENT", false)).toEqual({ isFavorite: false });
  });
});

describe("media activity persistence", () => {
  test("reports partial success when the review write fails", async () => {
    let logWasSaved = false;

    const result = await saveMediaActivity(
      async () => {
        logWasSaved = true;
      },
      async () => {
        throw new Error("review failed");
      },
    );

    expect(logWasSaved).toBe(true);
    expect(result).toBe("review-failed");
  });

  test("does not attempt the review when the log write fails", async () => {
    let reviewWasAttempted = false;
    const failure = new Error("log failed");

    await expect(
      saveMediaActivity(
        async () => {
          throw failure;
        },
        async () => {
          reviewWasAttempted = true;
        },
      ),
    ).rejects.toBe(failure);
    expect(reviewWasAttempted).toBe(false);
  });
});
