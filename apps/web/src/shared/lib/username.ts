import { z } from "zod";

import { isAvailableUsername } from "@tsuki/auth/username";

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be at most 30 characters")
  .regex(/^[a-zA-Z0-9_.]+$/, "Use only letters, numbers, underscores, and dots")
  .refine(isAvailableUsername, "This username is reserved");

export function parseUsername(value: string): string | null {
  const result = usernameSchema.safeParse(value);
  return result.success && result.data === value ? result.data.toLowerCase() : null;
}
