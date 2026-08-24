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
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-foreground">
        <motion.path
          d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"
          fill="currentColor"
          animate={{ scale: [1, 1.25, 0.85, 1], rotate: [0, 90] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: "50%", originY: "50%" }}
        />
      </svg>
    </div>
  );
}

// function OldLoader({ className }: LoaderProps) {
//   return (
//     <div
//       className={cn("flex min-h-64 items-center justify-center", className)}
//       role="status"
//       aria-label="Loading"
//     >
//       <div className="flex items-center gap-1.5">
//         {[0, 1, 2].map((index) => (
//           <motion.div
//             key={index}
//             className="h-2 w-2 rounded-full bg-foreground"
//             animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
//             transition={{
//               duration: 0.8,
//               repeat: Infinity,
//               delay: index * 0.15,
//               ease: "easeInOut",
//             }}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }
