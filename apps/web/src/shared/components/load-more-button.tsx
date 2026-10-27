"use client";

import { ChevronDown } from "lucide-react";

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
      aria-label="Load more"
      className={cn("size-9 rounded-full shadow-lg", className)}
      disabled={fetching}
      onClick={onLoadMore}
      size="icon-lg"
      variant="outline"
    >
      {fetching ? (
        <Loader className="min-h-0 [&>div]:size-4 [&_span_span]:h-1" />
      ) : (
        <ChevronDown className="size-4" />
      )}
    </Button>
  );
}
