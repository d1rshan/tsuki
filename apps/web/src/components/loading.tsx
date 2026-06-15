import { Loader2 } from "lucide-react";

export function Loading() {
  return (
    // <motion.div
    //   className="pointer-events-none fixed inset-0 z-40 bg-black/20 backdrop-blur-md"
    //   initial={{ opacity: 0 }}
    //   animate={{ opacity: 1 }}
    //   exit={{ opacity: 0 }}
    //   transition={{ duration: 0.5, ease: "easeOut" }}
    // />
    <div className="min-h-screen flex z-80 justify-center items-center">
      <Loader2 className="animate-spin" />
    </div>
  );
}
