"use client";

import { useEffect, useState } from "react";

import { SlidingNumber } from "./sliding-number";

export function Clock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    const updateTime = () => setTime(new Date());
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <time
      className="flex items-center gap-0.5 font-mono tabular-nums"
      aria-label={time?.toLocaleTimeString() ?? "Local time"}
    >
      <SlidingNumber value={time?.getHours() ?? 0} padStart />
      <span className="text-muted-foreground">:</span>
      <SlidingNumber value={time?.getMinutes() ?? 0} padStart />
      <span className="text-muted-foreground">:</span>
      <SlidingNumber value={time?.getSeconds() ?? 0} padStart />
    </time>
  );
}
