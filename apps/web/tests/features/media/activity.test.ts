import { expect, test } from "vitest";

import {
  completionStatus,
  createActivityForm,
  createLogMediaInput,
} from "@/features/media/activity";

test("form status and payload agree at known totals for anime and manga", () => {
  for (const type of ["ANIME", "MANGA"] as const) {
    const form = createActivityForm(type, null, null, 200);
    form.progress = "200";
    expect(completionStatus(200, 200, "CURRENT")).toBe("COMPLETED");
    expect(createLogMediaInput({ ...form, status: "CURRENT" }, false, 200)).toMatchObject({
      progress: 200,
      status: "COMPLETED",
    });
    expect(
      createLogMediaInput({ ...form, progress: "199", status: "COMPLETED" }, false, 200),
    ).toMatchObject({ progress: 199, status: "COMPLETED" });
    for (const total of [null, undefined, 0]) {
      expect(createLogMediaInput({ ...form, status: "CURRENT" }, false, total).status).toBe(
        "CURRENT",
      );
    }
  }
});

test("consumption dates stay calendar strings and unknown stays null", () => {
  const form = createActivityForm("ANIME", null, null);
  form.progress = "6";
  form.progressDate = "2026-11-01";
  expect(createLogMediaInput(form, false).progressDate).toBe("2026-11-01");
  form.progressDate = "";
  expect(createLogMediaInput(form, false).progressDate).toBeNull();
  expect(createLogMediaInput(form, false).completedAt).toBeNull();
});
