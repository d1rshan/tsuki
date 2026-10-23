"use client";

import { motion, useIsPresent, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";

import { Dialog, DialogContent, DialogTitle } from "@/shared/components/ui/dialog";

export function MediaModal({ children, morphId }: { children: React.ReactNode; morphId?: string }) {
  const router = useRouter();
  const isPresent = useIsPresent();
  const reduceMotion = useReducedMotion();
  const sharedId = reduceMotion ? undefined : morphId;

  return (
    // AnimatePresence keeps the accessible dialog mounted until its return morph finishes.
    <Dialog open onOpenChange={(open) => isPresent && !open && router.back()}>
      <DialogContent
        render={<motion.div layoutRoot />}
        finalFocus={() => (morphId ? document.getElementById(`media-trigger-${morphId}`) : true)}
        className="h-[calc(100dvh-1rem)] max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-5xl gap-0 overflow-visible border-0 !bg-transparent p-0 shadow-none ring-0 data-open:animate-none data-closed:animate-none sm:max-w-5xl"
        overlayClassName="bg-background/25 supports-backdrop-filter:backdrop-blur-[3px]"
      >
        <motion.div
          layoutId={sharedId ? `${sharedId}-surface` : undefined}
          layoutScroll
          initial={sharedId || reduceMotion ? false : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: sharedId || reduceMotion ? 1 : 0.98 }}
          transition={{ type: "spring", bounce: 0.05, duration: reduceMotion ? 0 : 0.25 }}
          style={{ borderRadius: 24 }}
          className="h-full w-full overflow-x-hidden overflow-y-auto bg-background shadow-2xl"
        >
          <DialogTitle className="sr-only">Media details</DialogTitle>
          {children}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
