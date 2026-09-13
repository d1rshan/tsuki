"use client";

import { formatDistanceToNow } from "date-fns";

/** Relative times depend on the client clock, so they are a client island. */
export function RelativeTime({ date }: { date: Date | string }) {
  return (
    <span suppressHydrationWarning>{formatDistanceToNow(new Date(date), { addSuffix: true })}</span>
  );
}
