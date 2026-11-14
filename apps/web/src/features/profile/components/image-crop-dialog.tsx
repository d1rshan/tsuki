"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LoaderCircle, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/shared/components/ui/dialog";
import { FieldGroup } from "@/shared/components/ui/field";

import type { PixelCrop } from "../image-utils";
import { VideoTrimTimeline } from "./video-trim-timeline";

type Props = {
  aspectRatio: number;
  cropShape?: "round" | "rect";
  imageSrc: string | null;
  file: File | null;
  isOpen: boolean;
  isProcessing?: boolean;
  progress?: string;
  onCancel: () => void;
  onReplace: () => void;
  onConfirm: (crop: PixelCrop, start: number, duration: number) => Promise<void>;
  title: string;
};

export function ImageCropDialog({
  aspectRatio,
  cropShape = "rect",
  imageSrc,
  file,
  isOpen,
  isProcessing = false,
  progress,
  onCancel,
  onReplace,
  onConfirm,
  title,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pointer = useRef<{ id: number; x: number; y: number; panX: number; panY: number } | null>(
    null,
  );
  const [boxWidth, setBoxWidth] = useState(280);
  const [natural, setNatural] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [start, setStart] = useState(0);
  const [duration, setDuration] = useState(6);
  const [total, setTotal] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const busy = saving || isProcessing;
  const isVideo = file?.type === "video/mp4";
  const boxHeight = boxWidth / aspectRatio;
  const scale = natural.width
    ? Math.max(boxWidth / natural.width, boxHeight / natural.height) * zoom
    : 1;
  const width = natural.width * scale;
  const height = natural.height * scale;
  const panX = Math.min(0, Math.max(boxWidth - width, (boxWidth - width) / 2 + pan.x));
  const panY = Math.min(0, Math.max(boxHeight - height, (boxHeight - height) / 2 + pan.y));
  const ready = natural.width > 0 && natural.height > 0;

  useEffect(() => {
    setNatural({ width: 0, height: 0 });
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setStart(0);
    setDuration(6);
    setTotal(0);
    setError("");
  }, [imageSrc]);

  const observeContainer = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;
      const observer = new ResizeObserver(([entry]) => {
        if (entry)
          setBoxWidth(Math.min(cropShape === "round" ? 280 : 512, entry.contentRect.width));
      });
      observer.observe(node);
      return () => observer.disconnect();
    },
    [cropShape],
  );

  useEffect(() => {
    const video = videoRef.current;
    if (video && total) {
      video.currentTime = start;
      void video.play().catch(() => {});
    }
  }, [start, duration, total]);

  const reset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setStart(0);
    setDuration(Math.min(6, total || 6));
  };
  const apply = async () => {
    if (!ready || busy) return;
    setSaving(true);
    setError("");
    try {
      await onConfirm(
        {
          x: Math.max(0, -panX / scale),
          y: Math.max(0, -panY / scale),
          width: boxWidth / scale,
          height: boxHeight / scale,
        },
        start,
        Math.min(duration, total ? total - start : 6),
      );
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Could not prepare media. Please retry.",
      );
    } finally {
      setSaving(false);
    }
  };
  const mediaStyle = {
    width: width || "auto",
    height: height || "auto",
    maxWidth: "none",
    transform: `translate(${panX}px, ${panY}px)`,
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !busy) onCancel();
      }}
    >
      <DialogContent
        overlayForceRender
        overlayClassName="z-[60]"
        className="z-[61] max-h-[90dvh] overflow-y-auto sm:max-w-lg"
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <FieldGroup>
          <div ref={observeContainer} className="flex min-w-0 flex-col items-center gap-4">
            <div
              role="application"
              aria-label="Crop preview. Use arrow keys to reposition."
              tabIndex={ready && !busy ? 0 : -1}
              className="relative overflow-hidden rounded-xl border bg-black/90 outline-none select-none touch-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ width: boxWidth, height: boxHeight, cursor: busy ? "wait" : "grab" }}
              onKeyDown={(e) => {
                if (busy) return;
                const direction = {
                  ArrowLeft: [-10, 0],
                  ArrowRight: [10, 0],
                  ArrowUp: [0, -10],
                  ArrowDown: [0, 10],
                }[e.key];
                if (direction) {
                  e.preventDefault();
                  setPan({
                    x: panX - (boxWidth - width) / 2 + direction[0]!,
                    y: panY - (boxHeight - height) / 2 + direction[1]!,
                  });
                }
              }}
              onPointerDown={(e) => {
                if (!ready || busy || pointer.current) return;
                e.currentTarget.setPointerCapture(e.pointerId);
                pointer.current = { id: e.pointerId, x: e.clientX, y: e.clientY, panX, panY };
              }}
              onPointerMove={(e) => {
                const drag = pointer.current;
                if (!drag || drag.id !== e.pointerId) return;
                setPan({
                  x: drag.panX + e.clientX - drag.x - (boxWidth - width) / 2,
                  y: drag.panY + e.clientY - drag.y - (boxHeight - height) / 2,
                });
              }}
              onPointerUp={() => {
                pointer.current = null;
              }}
              onPointerCancel={() => {
                pointer.current = null;
              }}
            >
              {imageSrc &&
                (isVideo ? (
                  <video
                    key={imageSrc}
                    ref={videoRef}
                    src={imageSrc}
                    autoPlay
                    muted
                    playsInline
                    loop
                    className="pointer-events-none absolute top-0 left-0"
                    style={mediaStyle}
                    onLoadedMetadata={(e) => {
                      const v = e.currentTarget;
                      if (!Number.isFinite(v.duration) || v.duration < 0.1) {
                        setError("This video cannot be read. Choose another file.");
                        return;
                      }
                      setNatural({ width: v.videoWidth, height: v.videoHeight });
                      setTotal(v.duration);
                      setDuration(Math.min(6, v.duration));
                    }}
                    onTimeUpdate={(e) => {
                      const v = e.currentTarget;
                      if (v.currentTime >= start + duration || v.currentTime < start)
                        v.currentTime = start;
                    }}
                    onError={() => setError("This video cannot be played. Choose another MP4.")}
                  />
                ) : (
                  <img
                    key={imageSrc}
                    src={imageSrc}
                    alt="Crop preview"
                    draggable={false}
                    className="pointer-events-none absolute top-0 left-0"
                    style={mediaStyle}
                    onLoad={(e) =>
                      setNatural({
                        width: e.currentTarget.naturalWidth,
                        height: e.currentTarget.naturalHeight,
                      })
                    }
                    onError={() => setError("This image cannot be read. Choose another file.")}
                  />
                ))}
              {cropShape === "round" && (
                <div className="pointer-events-none absolute inset-0 rounded-full border-2 border-white/80 shadow-[0_0_0_999px_rgba(0,0,0,0.65)]" />
              )}
              {!ready && !error && (
                <div className="absolute inset-0 grid place-items-center">
                  <LoaderCircle
                    className="size-5 animate-spin text-white"
                    aria-label="Loading preview"
                  />
                </div>
              )}
            </div>
            <div className="flex w-full items-center gap-3">
              <ZoomOut className="size-4 shrink-0 text-muted-foreground" />
              <input
                className="h-5 min-w-0 flex-1 cursor-pointer accent-primary"
                type="range"
                min={1}
                max={3}
                step={0.02}
                value={zoom}
                disabled={!ready || busy}
                aria-label="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
              />
              <ZoomIn className="size-4 shrink-0 text-muted-foreground" />
              <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                disabled={busy || !ready}
                onClick={reset}
                aria-label="Reset crop"
              >
                <RotateCcw className="size-3.5" />
              </Button>
            </div>
            {isVideo && total > 0 && imageSrc && (
              <div className="w-full px-2">
                <VideoTrimTimeline
                  src={imageSrc}
                  total={total}
                  start={start}
                  end={start + duration}
                  disabled={busy}
                  onChange={(nextStart, nextEnd) => {
                    setStart(nextStart);
                    setDuration(nextEnd - nextStart);
                  }}
                />
              </div>
            )}
            {error && (
              <p role="alert" className="w-full text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="mr-auto"
              onClick={onReplace}
              disabled={busy}
            >
              Replace
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
              Cancel
            </Button>
            <Button
              aria-label={busy ? progress || "Preparing media" : "Save"}
              type="button"
              onClick={apply}
              disabled={!ready || busy}
            >
              {busy && <LoaderCircle className="size-4 animate-spin" />}
              <span>{busy ? progress || "Preparing media…" : "Save"}</span>
            </Button>
          </div>
        </FieldGroup>
      </DialogContent>
    </Dialog>
  );
}
