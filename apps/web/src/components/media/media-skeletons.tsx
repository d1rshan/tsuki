import { Skeleton } from "@/components/ui/skeleton";

export function MediaPageSkeleton({ showTrailer = false }: { showTrailer?: boolean }) {
  return (
    <div className="pb-16">
      {/* Banner Skeleton */}
      <Skeleton className="h-[250px] w-full rounded-none md:h-[350px]" />

      <div className="container mx-auto max-w-6xl px-4">
        {/* Header Skeleton */}
        <div className="relative z-10 -mt-20 flex flex-col gap-6 border-b pb-8 md:-mt-32 md:flex-row md:items-end md:gap-8">
          {/* Poster Skeleton */}
          <div className="relative aspect-[3/4] w-40 shrink-0 overflow-hidden rounded-xl bg-background ring-1 ring-border shadow-xl md:w-56">
            <Skeleton className="h-full w-full rounded-none" />
          </div>

          {/* Header Info Skeleton */}
          <div className="flex flex-1 flex-col gap-3 pb-2 md:pb-4">
            <Skeleton className="h-10 w-3/4 md:h-14 md:w-1/2" />
            <Skeleton className="h-5 w-1/3" />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-12 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        </div>

        {/* Details Skeleton */}
        <div className="mt-8 grid grid-cols-1 gap-12 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr]">
          {/* Sidebar Skeleton */}
          <div className="space-y-8">
            <div className="space-y-3">
              <Skeleton className="h-4 w-16" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-14" />
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-4 w-16" />
              <div className="grid grid-cols-2 gap-4 md:grid-cols-1">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-12" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-14" />
                </div>
              </div>
            </div>
            {/* External Links Skeleton */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-28" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>

            {/* Actions Skeleton */}
            <div className="pt-4 border-t">
              <MediaActionsSkeleton />
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="min-w-0 space-y-4">
            <Skeleton className="h-7 w-24" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[95%]" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[85%]" />
            </div>

            {showTrailer && (
              <div className="pt-8 space-y-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-5 rounded-full" />
                  <Skeleton className="h-7 w-20" />
                </div>
                <Skeleton className="aspect-video w-full rounded-xl" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MediaActionsSkeleton() {
  return (
    <div className="flex gap-2">
      <Skeleton className="h-8 flex-1 rounded-xl" />
      <Skeleton className="h-8 w-8 shrink-0 rounded-xl" />
    </div>
  );
}
