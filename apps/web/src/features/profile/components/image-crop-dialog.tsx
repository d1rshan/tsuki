"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, ZoomIn, ZoomOut } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

import { getCroppedImageBlob, type PixelCrop } from "../image-utils";

type ImageCropDialogProps = {
  aspectRatio: number; // e.g. 1 for 1:1 avatar, 3 for 3:1 banner
  cropShape?: "round" | "rect";
  imageSrc: string | null;
  isOpen: boolean;
  isProcessing?: boolean;
  onCancel: () => void;
  onConfirm: (blob: Blob) => Promise<void> | void;
  title?: string;
};

export function ImageCropDialog({
  aspectRatio,
  cropShape = "rect",
  imageSrc,
  isOpen,
  isProcessing = false,
  onCancel,
  onConfirm,
  title = "Crop Image",
}: ImageCropDialogProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ pointerX: number; pointerY: number; panX: number; panY: number }>({
    pointerX: 0,
    pointerY: 0,
    panX: 0,
    panY: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  // Reset state whenever a new image is loaded
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setImageLoaded(false);
    }
  }, [isOpen, imageSrc]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    setImageLoaded(true);
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  // Calculate box dimensions inside container
  const boxWidth = cropShape === "round" ? 280 : 360;
  const boxHeight = boxWidth / aspectRatio;

  // Calculate base scale to fill the crop box
  const baseScale =
    naturalSize.width > 0 && naturalSize.height > 0
      ? Math.max(boxWidth / naturalSize.width, boxHeight / naturalSize.height)
      : 1;

  const currentScale = baseScale * zoom;
  const displayedWidth = naturalSize.width * currentScale;
  const displayedHeight = naturalSize.height * currentScale;

  // Max pan bounds (image must always cover the crop box)
  const minPanX = boxWidth - displayedWidth;
  const maxPanX = 0;
  const minPanY = boxHeight - displayedHeight;
  const maxPanY = 0;

  // Clamp pan when zoom changes
  const clampedPanX = Math.min(maxPanX, Math.max(minPanX, pan.x));
  const clampedPanY = Math.min(maxPanY, Math.max(minPanY, pan.y));

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!imageLoaded || isProcessing) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      panX: clampedPanX,
      panY: clampedPanY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.pointerX;
    const deltaY = e.clientY - dragStartRef.current.pointerY;

    const newX = Math.min(maxPanX, Math.max(minPanX, dragStartRef.current.panX + deltaX));
    const newY = Math.min(maxPanY, Math.max(minPanY, dragStartRef.current.panY + deltaY));

    setPan({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Pointer capture may already be released
      }
    }
  };

  const handleApplyCrop = async () => {
    if (!imageRef.current || !imageLoaded || naturalSize.width === 0) return;

    // Calculate crop rectangle in natural image pixels
    const cropPixelX = Math.max(0, -clampedPanX / currentScale);
    const cropPixelY = Math.max(0, -clampedPanY / currentScale);
    const cropPixelWidth = Math.min(naturalSize.width - cropPixelX, boxWidth / currentScale);
    const cropPixelHeight = Math.min(naturalSize.height - cropPixelY, boxHeight / currentScale);

    const pixelCrop: PixelCrop = {
      x: cropPixelX,
      y: cropPixelY,
      width: cropPixelWidth,
      height: cropPixelHeight,
    };

    try {
      const blob = await getCroppedImageBlob(imageRef.current, pixelCrop, "image/webp", 0.92);
      await onConfirm(blob);
    } catch (err) {
      console.error("Cropping failed:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isProcessing && onCancel()}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          {/* Crop Area Container */}
          <div
            ref={containerRef}
            className="relative flex items-center justify-center overflow-hidden rounded-xl border bg-black/90 select-none touch-none"
            style={{ width: boxWidth, height: boxHeight }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {imageSrc && (
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Crop preview"
                crossOrigin="anonymous"
                onLoad={handleImageLoad}
                draggable={false}
                className="absolute origin-top-left cursor-grab active:cursor-grabbing"
                style={{
                  width: displayedWidth || "auto",
                  height: displayedHeight || "auto",
                  transform: `translate(${clampedPanX}px, ${clampedPanY}px)`,
                  maxWidth: "none",
                  maxHeight: "none",
                }}
              />
            )}

            {/* Visual Guide / Mask */}
            {cropShape === "round" && (
              <div
                className="pointer-events-none absolute inset-0 rounded-full border-2 border-primary/80 ring-9999 ring-black/60"
                style={{ width: boxWidth, height: boxHeight }}
              />
            )}
            {cropShape === "rect" && (
              <div className="pointer-events-none absolute inset-0 border-2 border-primary/80" />
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Drag to reposition. Use the slider to zoom.
          </p>

          {/* Zoom Controls */}
          <div className="flex w-full max-w-[320px] items-center gap-3 px-2">
            <ZoomOut className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="range"
              min="1"
              max="3"
              step="0.02"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              disabled={!imageLoaded || isProcessing}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary focus:outline-none"
              aria-label="Zoom image"
            />
            <ZoomIn className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isProcessing}>
            Cancel
          </Button>
          <Button type="button" onClick={handleApplyCrop} disabled={!imageLoaded || isProcessing}>
            {isProcessing && <LoaderCircle data-icon="inline-start" className="animate-spin" />}
            {isProcessing ? "Uploading..." : "Save Image"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
