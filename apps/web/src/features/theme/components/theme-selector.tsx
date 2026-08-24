"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, animate, motion } from "framer-motion";
import { useTheme } from "next-themes";

import { Button } from "@/shared/components/ui/button";
import { getThemeId, THEMES } from "@/features/theme/themes";

const spring = { type: "spring", stiffness: 420, damping: 32 } as const;
// softer spring so scale changes glide instead of snapping
const scaleSpring = { type: "spring", stiffness: 260, damping: 22 } as const;

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const startTheme = useRef<string | undefined>(undefined);
  const stripRef = useRef<HTMLDivElement>(null);
  const drag = useRef({
    pointerId: -1,
    startX: 0,
    startScroll: 0,
    moved: false,
    lastX: 0,
    lastT: 0,
    velocity: 0,
  });

  const activeTheme = THEMES.find((t) => getThemeId(t) === theme) ?? THEMES[0];

  const openPicker = () => {
    startTheme.current = theme;
    setIsOpen(true);
  };

  // closing without an explicit commit always reverts
  const dismiss = () => {
    if (startTheme.current) setTheme(startTheme.current);
    setIsOpen(false);
  };

  const commit = (id: string) => {
    setTheme(id);
    setIsOpen(false);
  };

  const step = (delta: number) => {
    const index = THEMES.findIndex((t) => getThemeId(t) === theme);
    const nextIndex = Math.min(Math.max(index + delta, 0), THEMES.length - 1);
    const nextTheme = THEMES[nextIndex];
    if (nextIndex === index || !nextTheme) return;
    setTheme(getThemeId(nextTheme));
    const strip = stripRef.current;
    const child = strip?.children[nextIndex] as HTMLElement | undefined;
    if (!strip || !child) return;
    // framer-motion springs the strip so the active circle slides to center
    animate(strip.scrollLeft, child.offsetLeft - (strip.clientWidth - child.clientWidth) / 2, {
      ...spring,
      onUpdate: (value) => (strip.scrollLeft = value),
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
      if (event.key === "Enter" && theme) commit(theme);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const onPointerDown = (event: React.PointerEvent) => {
    if (event.pointerType !== "mouse") return; // touch uses native momentum
    const state = drag.current;
    state.pointerId = event.pointerId;
    state.startX = event.clientX;
    state.startScroll = stripRef.current?.scrollLeft ?? 0;
    state.moved = false;
    state.lastX = event.clientX;
    state.lastT = performance.now();
    state.velocity = 0;
    stripRef.current?.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const state = drag.current;
    if (state.pointerId !== event.pointerId || !stripRef.current) return;
    const offset = event.clientX - state.startX;
    if (Math.abs(offset) > 4) state.moved = true;
    stripRef.current.scrollLeft = state.startScroll - offset;
    const now = performance.now();
    state.velocity = (event.clientX - state.lastX) / Math.max(now - state.lastT, 1);
    state.lastX = event.clientX;
    state.lastT = now;
  };

  const endDrag = (event: React.PointerEvent) => {
    const state = drag.current;
    if (state.pointerId !== event.pointerId) return;
    state.pointerId = -1;
    // ponytail: single scrollBy fling instead of a decay loop; upgrade to
    // rAF momentum if the feel ever matters enough
    if (Math.abs(state.velocity) > 0.3) {
      stripRef.current?.scrollBy({
        left: -state.velocity * 250,
        behavior: "smooth",
      });
    }
  };

  const onClickCapture = (event: React.MouseEvent) => {
    if (!drag.current.moved) return;
    event.preventDefault();
    event.stopPropagation();
    drag.current.moved = false;
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Choose color theme"
        aria-expanded={isOpen}
        onClick={() => (isOpen ? dismiss() : openPicker())}
      >
        <span
          className="size-4 rounded-full ring-1 ring-foreground/15"
          style={{ backgroundColor: activeTheme.colors.primary }}
        />
      </Button>

      {/* portal: backdrop-filter on the navbar creates a containing block
          that hijacks position:fixed — render outside the app tree */}
      {createPortal(
        <AnimatePresence>
          {isOpen ? (
            <div key="theme-picker" className="fixed inset-0 z-50">
              <div
                role="presentation"
                className="absolute inset-0"
                onClick={dismiss}
                onPointerDown={(event) => {
                  // stop touch-scrolling the page from eating the tap
                  if (event.target === event.currentTarget) dismiss();
                }}
              />
              <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2">
                <motion.div
                  initial={{ y: 96, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 96, opacity: 0 }}
                  transition={spring}
                  className="pointer-events-auto flex items-center rounded-full border border-black/5 bg-background/80 p-2 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-background/55"
                >
                  <div
                    ref={stripRef}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    onClickCapture={onClickCapture}
                    // ponytail: fixed cap fits exactly 5 circles (5×2.5rem + 4×gap-2 + px-4)
                    className="flex max-w-[16.5rem] gap-2 overflow-x-auto px-4 py-1.5 [mask-image:linear-gradient(to_right,transparent,black_20px,black_calc(100%-20px),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  >
                    {THEMES.map((preset) => {
                      const id = getThemeId(preset);
                      const isActive = id === theme;
                      return (
                        <motion.button
                          key={id}
                          type="button"
                          aria-label={`${preset.name} theme`}
                          aria-pressed={isActive}
                          onClick={() => commit(id)}
                          onMouseEnter={() => setTheme(id)}
                          onFocus={() => setTheme(id)}
                          animate={{ scale: isActive ? 1.15 : 1 }}
                          whileHover={{ scale: isActive ? 1.18 : 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          transition={scaleSpring}
                          className="size-10 shrink-0 cursor-pointer rounded-full ring-1 ring-black/10 outline-none focus-visible:ring-2 focus-visible:ring-ring dark:ring-white/15"
                          style={{ backgroundColor: preset.colors.primary }}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            </div>
          ) : null}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
