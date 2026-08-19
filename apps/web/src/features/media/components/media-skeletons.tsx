import { Skeleton } from "@/shared/components/ui/skeleton";

export function MediaPageSkeleton() {
  return (
    <>
      <Skeleton className="h-[250px] rounded-none md:h-[350px]" />

      <div className="container mx-auto max-w-6xl px-4 pb-16">
        <div className="-mt-20 flex flex-col gap-6 border-b pb-8 md:-mt-32 md:flex-row md:items-end md:gap-8">
          <Skeleton className="aspect-[3/4] w-40 shrink-0 rounded-xl md:w-56" />
          <div className="flex flex-1 flex-col gap-3 pb-2 md:pb-4">
            <Skeleton className="h-10 w-3/4 md:h-14 md:w-1/2" />
            <Skeleton className="h-5 w-1/3" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-12 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-12 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr]">
          <aside className="flex flex-col gap-8">
            <div className="flex gap-2">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="size-8" />
            </div>
            <SkeletonGroup>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-14" />
              </div>
            </SkeletonGroup>
            <SkeletonGroup>
              <div className="flex flex-col gap-3">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-16" />
              </div>
            </SkeletonGroup>
          </aside>

          <div className="flex min-w-0 flex-col gap-8">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-4" />
              <Skeleton className="h-4 w-[95%]" />
              <Skeleton className="h-4" />
              <Skeleton className="h-4 w-[85%]" />
            </div>
            <Skeleton className="aspect-video rounded-xl" />
          </div>
        </div>
      </div>
    </>
  );
}

function SkeletonGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-4 w-16" />
      {children}
    </div>
  );
}
