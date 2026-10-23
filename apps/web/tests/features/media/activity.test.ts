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
