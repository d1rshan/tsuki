import { describe, expect, test } from "bun:test";

import {
  clampProgress,
  createActivityForm,
  createFavoriteInput,
  createLogMediaInput,
  hasLoggedActivity,
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

const review = {
  id: "review-1",
  mediaType: "ANIME",
  mediaId: 1,
  media: null,
  content: "good",
  containsSpoilers: false,
  createdAt: new Date(),
  updatedAt: new Date(),
} as const;

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

  test("keeps favorite updates separate from logs", () => {
    expect(createFavoriteInput(true)).toEqual({ isFavorite: true });
    expect(createFavoriteInput(false)).toEqual({ isFavorite: false });
  });

  test("does not treat favorite-only entries as logs", () => {
    expect(
      hasLoggedActivity(
        "ANIME",
        {
          mediaType: "ANIME",
          mediaId: 1,
          media: null,
          status: "PLANNING",
          score: null,
          progress: 0,
          progressVolumes: null,
          repeat: 0,
          isFavorite: true,
          notes: null,
          startedAt: null,
          completedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        null,
      ),
    ).toBe(false);
    expect(hasLoggedActivity("ANIME", null, review)).toBe(true);
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
