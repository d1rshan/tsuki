"use client";

import { useId } from "react";
import { LayoutGroup, MotionConfig, motion, useReducedMotion } from "framer-motion";

import {
  MEDIA_EASE_OUT,
  MEDIA_EXIT_DURATION,
  MEDIA_MORPH_TRANSITION,
  MEDIA_REVEAL_DELAY,
  MEDIA_REVEAL_DURATION,
} from "../motion";

export function MediaLayoutGroup({ children }: { children: React.ReactNode }) {
  const id = useId();

  return (
    <MotionConfig transition={MEDIA_MORPH_TRANSITION} reducedMotion="user">
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

  if (!morphId) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: {
          duration: MEDIA_REVEAL_DURATION,
          delay: reduceMotion ? 0 : MEDIA_REVEAL_DELAY,
          ease: MEDIA_EASE_OUT,
        },
      }}
      exit={{
        opacity: 0,
        transition: { duration: MEDIA_EXIT_DURATION, ease: MEDIA_EASE_OUT },
      }}
    >
      {children}
    </motion.div>
  );
}
