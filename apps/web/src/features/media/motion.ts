import type { Transition } from "framer-motion";

export const MEDIA_EASE_OUT = [0.23, 1, 0.32, 1] as const;
export const MEDIA_EASE_OUT_CSS = "cubic-bezier(0.23, 1, 0.32, 1)";
export const MEDIA_MORPH_TRANSITION = {
  type: "spring",
  bounce: 0,
  duration: 0.25,
} satisfies Transition;
export const MEDIA_OVERLAY_DURATION = 0.2;
export const MEDIA_REVEAL_DURATION = 0.15;
export const MEDIA_REVEAL_DELAY = 0.1;
export const MEDIA_EXIT_DURATION = 0.1;
