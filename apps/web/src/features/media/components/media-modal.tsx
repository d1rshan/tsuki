"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import type { MediaType } from "@tsuki/api/types";

import { Dialog, DialogContent, DialogTitle } from "@/shared/components/ui/dialog";

export function MediaModal({
  children,
  id,
  mediaType,
}: {
  children: React.ReactNode;
  id: number;
  mediaType: MediaType;
}) {
  const router = useRouter();
  const layoutId = `media-card-${mediaType}-${id}`;

  return (
    <Dialog open onOpenChange={(open) => !open && router.back()}>
      <DialogContent
        className="h-[calc(100dvh-1rem)] max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-none gap-0 overflow-hidden border-0 !bg-transparent p-0 shadow-none ring-0 data-open:animate-none data-closed:animate-none sm:max-w-none"
        overlayClassName="bg-background/25 supports-backdrop-filter:backdrop-blur-[3px]"
      >
        <motion.div
          layoutId={layoutId}
          transition={{ layout: { type: "spring", bounce: 0.05, duration: 0.3 } }}
          className="h-full w-full overflow-y-auto rounded-2xl bg-background shadow-2xl"
        >
          <DialogTitle className="sr-only">Media details</DialogTitle>
          {children}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
