"use client";

import { useEffect } from "react";
import { RotateCw } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { ContentState } from "@/shared/components/content-state";

/**
 * Catches server query failures when the API or AniList is unreachable.
 * Retrying re-fetches rather than replaying the same bad response.
 */
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 p-4">
      <ContentState
        error
        title="Something went wrong"
        description="Please try again in a moment."
      />

      <Button onClick={() => unstable_retry()} variant="outline">
        <RotateCw />
        Try again
      </Button>
    </div>
  );
}
