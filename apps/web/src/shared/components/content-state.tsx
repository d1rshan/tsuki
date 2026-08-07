import { SearchX } from "lucide-react";

type ContentStateProps = {
  description?: string;
  title: string;
};

export function EmptyState({ title, description }: ContentStateProps) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
      <SearchX className="size-8 opacity-40" />
      <p className="font-medium">{title}</p>
      {description ? <p className="text-sm">{description}</p> : null}
    </div>
  );
}

export function ErrorState({ title, description }: ContentStateProps) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-1 text-center text-destructive">
      <p className="font-medium">{title}</p>
      {description ? <p className="text-sm opacity-80">{description}</p> : null}
    </div>
  );
}
