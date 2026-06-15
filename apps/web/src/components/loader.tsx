"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

type LoaderProps = {
  variant?: "overlay" | "inline";
};

export function Loader({ variant = "inline" }: LoaderProps) {
  return (
    <motion.div
      className={cn(
        "flex items-center justify-center",
        variant === "overlay" && "fixed inset-0 z-50 bg-background",
        variant === "inline" && "min-h-screen w-full",
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-2 w-2 rounded-full bg-foreground"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
