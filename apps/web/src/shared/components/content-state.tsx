import type { LucideIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";

type ContentStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  error?: boolean;
};

export function ContentState({ title, description, icon: Icon, error }: ContentStateProps) {
  return (
    <div
      className={cn(
        "flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground",
        error && "text-destructive",
      )}
    >
      {Icon ? <Icon className="size-8 opacity-40" /> : null}
      <p className="font-medium">{title}</p>
      {description ? <p className={cn("text-sm", error && "opacity-80")}>{description}</p> : null}
    </div>
  );
}
