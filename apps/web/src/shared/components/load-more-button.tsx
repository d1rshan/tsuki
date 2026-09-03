"use client";

import { Loader } from "@/shared/components/loader";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

export function LoadMoreButton({
  className,
  fetching,
  hasNext,
  onLoadMore,
}: {
  className?: string;
  fetching: boolean;
  hasNext: boolean;
  onLoadMore: () => void;
}) {
  if (!hasNext) return null;

  return (
    <Button
      className={cn("relative mx-auto mt-6 flex w-fit", className)}
      disabled={fetching}
      onClick={onLoadMore}
      variant="outline"
    >
      {/* Label stays mounted (invisible) while loading so the button keeps its width. */}
      <span className={cn(fetching && "invisible")}>Load more</span>
      {fetching ? <Loader className="absolute inset-0 min-h-0 [&>svg]:size-4" /> : null}
    </Button>
  );
}
