"use client";

import { motion } from "framer-motion";

function SlidingDigit({ value }: { value: number }) {
  return (
    <span className="relative inline-block h-[1em] w-[1ch] overflow-hidden leading-none tabular-nums">
      {Array.from({ length: 10 }, (_, number) => {
        let offset = (number - value + 10) % 10;
        if (offset > 5) offset -= 10;

        return (
          <motion.span
            key={number}
            initial={false}
            animate={{ y: `${offset}em` }}
            transition={{ type: "spring", stiffness: 280, damping: 18, mass: 0.3 }}
            className="absolute inset-x-0 top-0 text-center"
          >
            {number}
          </motion.span>
        );
      })}
    </span>
  );
}

export function SlidingNumber({ value, padStart = false }: { value: number; padStart?: boolean }) {
  const digits = Math.abs(value)
    .toString()
    .padStart(padStart ? 2 : 1, "0")
    .split("");

  return (
    <span className="inline-flex items-center">
      {value < 0 && "-"}
      {digits.map((digit, index) => (
        <SlidingDigit key={index} value={Number(digit)} />
      ))}
    </span>
  );
}
