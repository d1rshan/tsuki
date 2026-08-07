import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

type LoadingIndicatorProps = {
  className?: string;
  label?: string;
};

export function LoadingIndicator({ className, label = "Loading" }: LoadingIndicatorProps) {
  return (
    <div
      className={cn("flex min-h-64 items-center justify-center", className)}
      role="status"
      aria-label={label}
    >
      <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}
