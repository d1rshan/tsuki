"use client";

import { useEffect, useState } from "react";

import { SlidingNumber } from "@/shared/components/sliding-number";

export function Clock() {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <time
      className="flex items-center gap-0.5 font-mono tabular-nums"
      dateTime={time.toISOString()}
      aria-label={time.toLocaleTimeString()}
    >
      <SlidingNumber value={time.getHours()} padStart />
      <span>:</span>
      <SlidingNumber value={time.getMinutes()} padStart />
      <span>:</span>
      <SlidingNumber value={time.getSeconds()} padStart />
    </time>
  );
}
