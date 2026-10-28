import { Skeleton } from "@/shared/components/ui/skeleton";

export function DiscoverSkeleton() {
  return (
    <section className="pb-24 pt-32" aria-label="Loading discover" role="status">
      <span className="sr-only">Loading discover</span>
      <div
        aria-hidden="true"
        className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-5"
      >
        {Array.from({ length: 10 }, (_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="aspect-[3/4] rounded-xl motion-reduce:animate-none" />
            <Skeleton className="h-4 w-3/4 motion-reduce:animate-none" />
          </div>
        ))}
      </div>
    </section>
  );
}
