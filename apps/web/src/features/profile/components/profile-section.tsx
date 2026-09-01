/** Shared bento tile surface — every overview card reads as the same material. */
export const BENTO_CARD = "rounded-2xl border border-border/50 bg-muted/20";

export function ProfileSection({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6">
      <h2 className="flex items-baseline gap-2 text-2xl font-bold tracking-tight">
        {title}
        {count != null && (
          <span className="text-lg font-normal text-muted-foreground tabular-nums">({count})</span>
        )}
      </h2>
      {children}
    </section>
  );
}
