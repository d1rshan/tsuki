export function ProfileHeaderSkeleton() {
  return (
    <>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted/30 to-transparent -z-10 pointer-events-none" />
      <div className="flex flex-col items-center text-center gap-6 mb-12">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-muted animate-pulse ring-1 ring-border/50" />
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
          <div className="h-5 w-32 bg-muted animate-pulse rounded-md mt-1" />

          <div className="flex justify-center gap-8 mt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="h-8 w-12 bg-muted animate-pulse rounded-md" />
                <div className="h-3 w-16 bg-muted animate-pulse rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export function ProfileOverviewSkeleton() {
  return (
    <div className="space-y-16 pb-16 pt-6">
      <section className="space-y-6">
        <div className="h-8 w-32 bg-muted animate-pulse rounded-md" />
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="grid gap-x-12 gap-y-8 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 p-2">
              <div className="w-16 aspect-[3/4] rounded-lg bg-muted animate-pulse" />
              <div className="flex flex-1 flex-col py-1 gap-2 mt-1">
                <div className="h-5 w-3/4 bg-muted animate-pulse rounded-md" />
                <div className="h-4 w-1/2 bg-muted animate-pulse rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function ProfileLibrarySkeleton() {
  return (
    <div className="space-y-12 pb-16 pt-6">
      {Array.from({ length: 2 }).map((_, sectionIndex) => (
        <section key={sectionIndex} className="mb-12">
          <div className="h-8 w-48 bg-muted animate-pulse rounded-md mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function ProfileReviewsSkeleton() {
  return (
    <div className="max-w-3xl space-y-12 pb-16 pt-6">
      <div className="h-8 w-32 bg-muted animate-pulse rounded-md mb-8" />
      <div className="flex flex-col gap-10">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-6">
            <div className="w-24 h-36 rounded-lg bg-muted animate-pulse shrink-0" />
            <div className="flex-1 space-y-4 py-2">
              <div className="h-6 w-2/3 bg-muted animate-pulse rounded-md" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
                <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
