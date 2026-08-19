"use client";

import { motion } from "framer-motion";

import { cn } from "@/shared/lib/utils";

type LoaderProps = {
  className?: string;
};

export function Loader({ className }: LoaderProps) {
  return (
    <div
      className={cn("flex min-h-64 items-center justify-center", className)}
      role="status"
      aria-label="Loading"
    >
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="h-2 w-2 rounded-full bg-foreground"
            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: index * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
