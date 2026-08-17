"use client";

import { useTransition } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";

import { Button } from "@/shared/components/ui/button";

export function ProfileConnectionsPagination({ pageCount }: { pageCount: number }) {
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({
      history: "push",
      shallow: false,
      startTransition,
    }),
  );

  if (pageCount <= 1) return null;

  const currentPage = Math.min(pageCount, Math.max(1, page));

  return (
    <nav className="flex items-center justify-center gap-3 pb-16" aria-label="Connection pages">
      <Button
        type="button"
        variant="outline"
        disabled={currentPage === 1 || isPending}
        onClick={() => void setPage(currentPage - 1)}
      >
        <ChevronLeft data-icon="inline-start" />
        Previous
      </Button>
      <span className="text-sm text-muted-foreground" aria-live="polite">
        Page {currentPage} of {pageCount}
      </span>
      <Button
        type="button"
        variant="outline"
        disabled={currentPage === pageCount || isPending}
        onClick={() => void setPage(currentPage + 1)}
      >
        Next
        <ChevronRight data-icon="inline-end" />
      </Button>
    </nav>
  );
}
