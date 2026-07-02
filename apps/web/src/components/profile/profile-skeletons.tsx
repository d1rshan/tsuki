import { Skeleton } from "@/components/ui/skeleton";

export function ProfileHeaderSkeleton() {
  return (
    <div className="flex flex-col mb-8 border-b pb-8">
      {/* Banner */}
      <Skeleton className="w-full h-32 md:h-48 rounded-2xl mb-6" />

      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start px-2">
        {/* Avatar */}
        <div className="relative -mt-16 md:-mt-20 ml-2 md:ml-6 shrink-0">
          <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-full ring-4 ring-background" />
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col w-full pt-1">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <Skeleton className="h-8 md:h-9 w-48 mb-2" />
              <Skeleton className="h-4 md:h-5 w-32" />
            </div>
            <div className="shrink-0">
              <Skeleton className="h-9 w-28 rounded-full" />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-full max-w-2xl" />
            <Skeleton className="h-4 w-4/5 max-w-xl" />
            <Skeleton className="h-4 w-2/3 max-w-lg" />
          </div>

          {/* Social links (mock) */}
          <div className="flex flex-wrap gap-4 mt-5">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>

          {/* Tabs skeleton */}
          <div className="mt-8 mb-2">
            <Skeleton className="h-10 w-64 rounded-2xl" />
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-row md:flex-col justify-start md:justify-center gap-6 md:gap-5 w-full md:w-auto md:min-w-[120px] pt-6 md:pt-2 shrink-0 md:border-l md:pl-6 border-border/50">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}
