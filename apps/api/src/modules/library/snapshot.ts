import type { FeedActivitySnapshot } from "@tsuki/db";

/**
 * The LOG card shows what the entry looked like when it was logged, so the
 * snapshot copies the viewer-facing fields of the saved entry.
 *
 * Pure mapping, kept free of database imports so it stays cheap to test.
 */
export function logSnapshot(entry: {
  status: "CURRENT" | "PLANNING" | "COMPLETED" | "DROPPED" | "PAUSED" | "REPEATING" | null;
  score: number | null;
  progress: number;
  progressVolumes: number | null;
  repeat: number;
}): FeedActivitySnapshot {
  return {
    status: entry.status,
    score: entry.score,
    progress: entry.progress,
    progressVolumes: entry.progressVolumes,
    repeat: entry.repeat,
  };
}
