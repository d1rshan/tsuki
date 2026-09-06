import { Skeleton } from "@/shared/components/ui/skeleton";

/** Full-header stand-in — only paints while the shell resolves route params. */
export function ProfileHeaderSkeleton() {
  return (
    <header className="mb-8" aria-hidden>
      <Skeleton className="mb-6 h-48 w-full rounded-2xl md:h-64" />

      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 px-2 md:px-6">
        <div className="flex min-w-0 flex-wrap items-start gap-x-6 gap-y-3">
          <div className="-mt-16 flex shrink-0 flex-col items-center md:-mt-20">
            <Skeleton className="h-24 w-24 rounded-full md:h-32 md:w-32" />
          </div>

          <div className="flex gap-2 pt-3">
            <Skeleton className="h-9 w-20 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-full" />
            <Skeleton className="h-9 w-20 rounded-full" />
          </div>
        </div>
      </div>
    </header>
  );
}
