"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/shared/lib/utils";

type Props = {
  src: string;
  total: number;
  start: number;
  end: number;
  disabled: boolean;
  onChange: (start: number, end: number) => void;
};

type Edge = "start" | "end" | "selection";
const time = (value: number) => `${value.toFixed(1)}s`;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function VideoTrimTimeline({ src, total, start, end, disabled, onChange }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ id: number; edge: Edge; x: number; start: number; end: number } | null>(
    null,
  );

  useEffect(() => {
    const controller = new AbortController();
    const video = document.createElement("video");
    video.muted = true;
    video.preload = "auto";
    const wait = (event: string) =>
      new Promise<void>((resolve, reject) => {
        video.addEventListener(event, () => resolve(), { once: true, signal: controller.signal });
        video.addEventListener("error", () => reject(new Error("Preview unavailable")), {
          once: true,
          signal: controller.signal,
        });
        controller.signal.addEventListener("abort", () => reject(controller.signal.reason), {
          once: true,
        });
      });
    const loaded = wait("loadeddata");
    video.src = src;
    void (async () => {
      await loaded;
      const target = canvas.current;
      const context = target?.getContext("2d");
      if (!target || !context) return;
      target.width = Math.round((track.current?.clientWidth ?? 384) * 2);
      const frameWidth = target.width / 8;
      const ratio = Math.max(frameWidth / video.videoWidth, target.height / video.videoHeight);
      const sourceWidth = frameWidth / ratio;
      const sourceHeight = target.height / ratio;
      for (let index = 0; index < 8 && !controller.signal.aborted; index++) {
        const position = Math.min(total - 0.05, ((index + 0.5) * total) / 8);
        const sought = wait("seeked");
        video.currentTime = Math.max(0, position);
        await sought;
        context.drawImage(
          video,
          (video.videoWidth - sourceWidth) / 2,
          (video.videoHeight - sourceHeight) / 2,
          sourceWidth,
          sourceHeight,
          index * frameWidth,
          0,
          frameWidth,
          target.height,
        );
      }
    })().catch(() => {
      /* The trim control remains usable if thumbnails cannot decode. */
    });
    return () => {
      controller.abort();
      video.removeAttribute("src");
      video.load();
    };
  }, [src, total]);

  const update = (nextStart: number, nextEnd: number) => {
    onChange(Number(nextStart.toFixed(2)), Number(nextEnd.toFixed(2)));
  };

  const changeEdge = (edge: "start" | "end", value: number) => {
    if (edge === "start") update(clamp(value, Math.max(0, end - 6), end - 0.1), end);
    else update(start, clamp(value, start + 0.1, Math.min(total, start + 6)));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground tabular-nums">
        <span>
          {time(start)} – {time(end)}
        </span>
        <span>{time(end - start)} / 6s</span>
      </div>
      <div
        ref={track}
        role="group"
        aria-label="Trim video"
        aria-disabled={disabled}
        className={cn(
          "relative h-12 rounded-md bg-muted select-none touch-none",
          disabled && "pointer-events-none opacity-50",
        )}
        onPointerDown={(event) => {
          if (disabled || event.button !== 0 || drag.current) return;
          const rect = event.currentTarget.getBoundingClientRect();
          const edge = (event.target as HTMLElement).closest<HTMLElement>("[data-trim-edge]")
            ?.dataset.trimEdge as Edge | undefined;
          if (!edge) {
            const duration = end - start;
            const next = clamp(
              ((event.clientX - rect.left) / rect.width) * total - duration / 2,
              0,
              total - duration,
            );
            update(next, next + duration);
            return;
          }
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = { id: event.pointerId, edge, x: event.clientX, start, end };
        }}
        onPointerMove={(event) => {
          const current = drag.current;
          if (!current || current.id !== event.pointerId || !track.current) return;
          const delta =
            ((event.clientX - current.x) / track.current.getBoundingClientRect().width) * total;
          if (current.edge === "selection") {
            const next = clamp(current.start + delta, 0, total - (current.end - current.start));
            update(next, next + current.end - current.start);
          } else changeEdge(current.edge, current[current.edge] + delta);
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        <canvas
          ref={canvas}
          width={768}
          height={96}
          aria-hidden
          className="pointer-events-none absolute inset-0 size-full rounded-md"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 rounded-l-md bg-background/70"
          style={{ width: `${(start / total) * 100}%` }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 rounded-r-md bg-background/70"
          style={{ width: `${((total - end) / total) * 100}%` }}
        />
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="Move selected clip"
          aria-disabled={disabled}
          onKeyDown={(event) => {
            if (disabled) return;
            const duration = end - start;
            const delta = event.shiftKey ? 1 : 0.1;
            const next = {
              ArrowLeft: start - delta,
              ArrowRight: start + delta,
              Home: 0,
              End: total - duration,
            }[event.key];
            if (next !== undefined) {
              event.preventDefault();
              const value = clamp(next, 0, total - duration);
              update(value, value + duration);
            }
          }}
          data-trim-edge="selection"
          className="absolute inset-y-0 cursor-grab border-y-2 border-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
          style={{ left: `${(start / total) * 100}%`, width: `${((end - start) / total) * 100}%` }}
        />
        {(["start", "end"] as const).map((edge) => (
          <div
            key={edge}
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-label={`Trim ${edge}`}
            aria-valuemin={edge === "start" ? Math.max(0, end - 6) : start + 0.1}
            aria-valuemax={edge === "start" ? end - 0.1 : Math.min(total, start + 6)}
            aria-valuenow={Number((edge === "start" ? start : end).toFixed(3))}
            aria-valuetext={time(edge === "start" ? start : end)}
            aria-disabled={disabled}
            data-trim-edge={edge}
            className="absolute inset-y-0 z-10 flex w-4 -translate-x-1/2 cursor-ew-resize items-center justify-center rounded-sm bg-foreground text-background outline-none before:absolute before:-inset-x-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            style={{ left: `${((edge === "start" ? start : end) / total) * 100}%` }}
            onKeyDown={(event) => {
              if (disabled) return;
              const value = edge === "start" ? start : end;
              const delta = event.shiftKey ? 1 : 0.1;
              const next = {
                ArrowLeft: value - delta,
                ArrowDown: value - delta,
                ArrowRight: value + delta,
                ArrowUp: value + delta,
                Home: 0,
                End: total,
              }[event.key];
              if (next !== undefined) {
                event.preventDefault();
                changeEdge(edge, next);
              }
            }}
          >
            <span aria-hidden className="h-4 w-0.5 rounded-full bg-background/80" />
          </div>
        ))}
      </div>
    </div>
  );
}
