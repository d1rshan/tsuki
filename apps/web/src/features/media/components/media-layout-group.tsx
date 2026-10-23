"use client";

import { useId } from "react";
import { LayoutGroup, MotionConfig, motion, useReducedMotion } from "framer-motion";

export function MediaLayoutGroup({ children }: { children: React.ReactNode }) {
  const id = useId();

  return (
    <MotionConfig transition={{ type: "spring", bounce: 0, duration: 0.18 }} reducedMotion="user">
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

  if (!morphId || reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.15, delay: 0.04, ease: "easeOut" },
      }}
      exit={{
        opacity: 0,
        transition: { duration: 0.1, ease: "easeOut" },
      }}
    >
      {children}
    </motion.div>
  );
}
