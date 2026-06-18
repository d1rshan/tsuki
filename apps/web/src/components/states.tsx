import { Search } from "lucide-react";

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
      <Search className="size-8 opacity-40" />
      <p className="font-medium">{title}</p>
      {description ? <p className="text-sm">{description}</p> : null}
    </div>
  );
}

export function ErrorState({ message, description }: { message: string; description: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-1 text-destructive">
      <p className="font-medium">{message}</p>
      <p className="text-sm opacity-80">{description}</p>
    </div>
  );
}
