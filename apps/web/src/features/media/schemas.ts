import { z } from "zod";

import { MAX_MEDIA_ID } from "./media";

export const mediaTypeSchema = z.enum(["ANIME", "MANGA"]);
export const mediaIdSchema = z.number().int().positive().max(MAX_MEDIA_ID);

export const logMediaSchema = z.object({
  status: z.enum(["CURRENT", "PLANNING", "COMPLETED", "DROPPED", "PAUSED", "REPEATING"]).optional(),
  score: z.number().int().min(1).max(10).nullable().optional(),
  progress: z.number().int().nonnegative().optional(),
  isFavorite: z.boolean().optional(),
});

export type LogMediaInput = z.input<typeof logMediaSchema>;
