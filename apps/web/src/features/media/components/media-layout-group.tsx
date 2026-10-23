"use client";

import { useId } from "react";
import { LayoutGroup, MotionConfig, motion, useReducedMotion } from "framer-motion";

export function MediaLayoutGroup({ children }: { children: React.ReactNode }) {
  const id = useId();

  return (
    <MotionConfig
      transition={{ type: "spring", bounce: 0.05, duration: 0.25 }}
      reducedMotion="user"
    >
      <LayoutGroup id={id}>{children}</LayoutGroup>
    </MotionConfig>
  );
}

export function MediaDetailsReveal({
  children,
  className,
  morphId,
}: {
  children: React.ReactNode;
  className?: string;
  morphId?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={morphId && !reduceMotion ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      exit={morphId && !reduceMotion ? { opacity: 0, y: 8 } : undefined}
      transition={{ duration: reduceMotion ? 0 : 0.15, delay: morphId ? 0.1 : 0 }}
    >
      {children}
    </motion.div>
  );
}
