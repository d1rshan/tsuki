"use client";

import { useLayoutEffect, useRef } from "react";
import { motion, useIsPresent, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/shared/components/ui/dialog";

export function MediaModal({ children, morphId }: { children: React.ReactNode; morphId?: string }) {
  const router = useRouter();
  const isPresent = useIsPresent();
  const reduceMotion = useReducedMotion();
  const sharedId = reduceMotion ? undefined : morphId;
  const scrollRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, []);

  return (
    // AnimatePresence keeps the accessible dialog mounted until its return morph finishes.
    <Dialog open onOpenChange={(open) => isPresent && !open && router.back()}>
      <DialogContent
        mobileSheet={false}
        render={<motion.div layoutRoot />}
        overlayRender={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
            style={{ willChange: "opacity" }}
          />
        }
        initialFocus={() => scrollRef.current}
        finalFocus={() => (morphId ? document.getElementById(`media-trigger-${morphId}`) : true)}
        className="h-[calc(100dvh-1rem)] max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-none gap-0 overflow-visible border-0 !bg-transparent p-0 shadow-none ring-0 !backdrop-blur-none data-open:animate-none data-closed:animate-none sm:max-w-none"
        overlayClassName="bg-black/30 !backdrop-blur-none supports-backdrop-filter:!backdrop-blur-none data-open:animate-none data-closed:animate-none"
      >
        <motion.div
          layoutId={sharedId ? `${sharedId}-surface` : undefined}
          layoutScroll
          initial={sharedId || reduceMotion ? false : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={sharedId ? undefined : { opacity: 0, scale: 0.98 }}
          transition={{ type: "spring", bounce: 0, duration: reduceMotion ? 0 : 0.18 }}
          ref={scrollRef}
          style={{
            borderRadius: 24,
            willChange: "transform",
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
          }}
          className="no-scrollbar h-full w-full overflow-x-hidden overflow-y-auto bg-background shadow-2xl isolate"
        >
          <div className="sticky top-0 z-30 flex h-0 justify-end px-3">
            <DialogClose
              render={
                <Button
                  variant="outline"
                  size="icon-lg"
                  className="relative top-[calc(env(safe-area-inset-top)+0.75rem)] rounded-full border-border/60 bg-background/90 text-foreground shadow-md backdrop-blur-sm hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                  aria-label="Close media details"
                />
              }
            >
              <X aria-hidden="true" />
            </DialogClose>
          </div>
          <DialogTitle className="sr-only">Media details</DialogTitle>
          {children}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
