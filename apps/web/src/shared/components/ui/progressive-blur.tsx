import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/utils";

const GRADIENT_ANGLES = { top: 0, right: 90, bottom: 180, left: 270 };

type ProgressiveBlurProps = ComponentProps<"div"> & {
  direction?: keyof typeof GRADIENT_ANGLES;
  blurLayers?: number;
  blurIntensity?: number;
};

export function ProgressiveBlur({
  direction = "bottom",
  blurLayers = 8,
  blurIntensity = 0.25,
  className,
  ...props
}: ProgressiveBlurProps) {
  const layers = Math.max(blurLayers, 2);
  const segmentSize = 1 / (layers + 1);

  return (
    <div aria-hidden="true" className={cn("pointer-events-none relative", className)} {...props}>
      {Array.from({ length: layers }, (_, index) => {
        const stops = [0, 1, 2, 3].map(
          (offset) =>
            `rgba(255, 255, 255, ${offset === 1 || offset === 2 ? 1 : 0}) ${(index + offset) * segmentSize * 100}%`,
        );
        const mask = `linear-gradient(${GRADIENT_ANGLES[direction]}deg, ${stops.join(", ")})`;
        const blur = `blur(${index * blurIntensity}px)`;

        return (
          <div
            key={index}
            className="absolute inset-0 rounded-[inherit]"
            style={{
              maskImage: mask,
              WebkitMaskImage: mask,
              backdropFilter: blur,
              WebkitBackdropFilter: blur,
            }}
          />
        );
      })}
    </div>
  );
}
