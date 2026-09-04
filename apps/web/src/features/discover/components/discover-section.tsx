import { cn } from "@/shared/lib/utils";

type DiscoverSectionProps = React.ComponentProps<"section"> & {
  actions?: React.ReactNode;
  title?: string;
};

export function DiscoverSection({
  actions,
  children,
  className,
  title,
  ...props
}: DiscoverSectionProps) {
  return (
    <section className={cn("flex flex-col gap-4 md:gap-5", className)} {...props}>
      {title || actions ? (
        <header className="flex flex-wrap items-center justify-between gap-3">
          {title ? (
            <h2 className="text-3xl font-black uppercase tracking-tight md:text-5xl">{title}</h2>
          ) : null}
          {actions}
        </header>
      ) : null}
      {children}
    </section>
  );
}
