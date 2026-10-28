import { cn } from "@/shared/lib/utils";

type SoftBlurEdgeProps = {
  edge: "top" | "bottom";
  className?: string;
};

export function SoftBlurEdge({ edge, className }: SoftBlurEdgeProps) {
  const isTop = edge === "top";
  const direction = isTop ? "to bottom" : "to top";
  const layers = isTop
    ? [
        "h-10 max-sm:h-6 backdrop-blur-[2px] max-sm:backdrop-filter-none",
        "h-20 max-sm:h-12 backdrop-blur-[3px]",
      ]
    : [
        "h-8 max-sm:h-5 backdrop-blur-[2px] max-sm:backdrop-filter-none",
        "h-16 max-sm:h-10 backdrop-blur-[3px]",
      ];
  const style = {
    backgroundImage: `linear-gradient(${direction}, color-mix(in srgb, var(--background) 85%, transparent), color-mix(in srgb, var(--background) 35%, transparent), transparent)`,
    maskImage: `linear-gradient(${direction}, black 0%, black 40%, transparent 100%)`,
  };

  return (
    <>
      {layers.map((layer) => (
        <div
          key={layer}
          aria-hidden="true"
          className={cn(
            "pointer-events-none fixed inset-x-0 z-30",
            isTop ? "top-0" : "bottom-0 max-md:[[data-search-keyboard]_&]:hidden",
            layer,
            className,
          )}
          style={style}
        />
      ))}
    </>
  );
}
