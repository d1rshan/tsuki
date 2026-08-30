"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, Pencil, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { apiClient } from "@/shared/lib/api-client";
import { cn } from "@/shared/lib/utils";

import {
  type ImageUploadType,
  uploadBlobToImageKit,
  validateProfileImageFile,
} from "../image-utils";
import { ImageCropDialog } from "./image-crop-dialog";

type ProfileImageControlsProps = {
  aspectRatio: number;
  className?: string;
  cropShape?: "round" | "rect";
  cropTitle?: string;
  hasImage: boolean;
  onRemove: () => Promise<void> | void;
  onUploadSuccess: (url: string, fileId: string) => Promise<void> | void;
  type: ImageUploadType;
  uploadFolder: string;
};

export function ProfileImageControls({
  aspectRatio,
  className,
  cropShape = "rect",
  cropTitle,
  hasImage,
  onRemove,
  onUploadSuccess,
  type,
  uploadFolder,
}: ProfileImageControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Click outside to collapse the action buttons
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        !isCropOpen
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, isCropOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateProfileImageFile(file, type);
    if (!validation.valid) {
      toast.error(validation.error);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFileUrl(objectUrl);
    setIsCropOpen(true);
  };

  const handleCancelCrop = () => {
    if (selectedFileUrl) {
      URL.revokeObjectURL(selectedFileUrl);
      setSelectedFileUrl(null);
    }
    setIsCropOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleConfirmCrop = async (blob: Blob) => {
    setIsUploading(true);
    try {
      const { data: auth, error } = await apiClient.me.profile["upload-auth"].get();
      if (error || !auth) {
        toast.error("Failed to get upload authorization. Please try again.");
        setIsUploading(false);
        return;
      }

      const fileName = `${type}-${Date.now()}.webp`;
      const uploadResult = await uploadBlobToImageKit({
        blob,
        fileName,
        folder: uploadFolder,
        auth: {
          token: auth.token,
          expire: auth.expire,
          signature: auth.signature,
          publicKey: auth.publicKey,
        },
      });

      await onUploadSuccess(uploadResult.url, uploadResult.fileId);
      handleCancelCrop();
      setIsOpen(false);
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    setIsRemoving(true);
    try {
      await onRemove();
      setIsOpen(false);
    } catch {
      toast.error("Failed to remove image.");
    } finally {
      setIsRemoving(false);
    }
  };

  const isBusy = isUploading || isRemoving;

  return (
    <div ref={containerRef} className={cn("relative z-20 flex items-center gap-1.5", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={isBusy}
        aria-label={`Upload ${type}`}
      />

      {isBusy ? (
        <div className="glass flex h-8 w-8 items-center justify-center rounded-full border border-border/50 shadow-md md:h-9 md:w-9">
          <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
        </div>
      ) : !isOpen ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          className="glass flex h-8 w-8 items-center justify-center rounded-full border border-border/50 text-foreground shadow-md transition-all duration-200 hover:scale-105 hover:border-primary/50 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none md:h-9 md:w-9"
          aria-label={`Edit ${type}`}
        >
          <Pencil className="h-4 w-4" />
        </button>
      ) : (
        <div className="flex items-center gap-1.5 animate-in fade-in-0 zoom-in-95 duration-150">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="glass flex h-8 w-8 items-center justify-center rounded-full border border-border/50 text-foreground shadow-md transition-all duration-200 hover:scale-105 hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none md:h-9 md:w-9"
            aria-label={`Upload new ${type}`}
          >
            <Upload className="h-4 w-4" />
          </button>

          {hasImage && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void handleDelete();
              }}
              className="glass flex h-8 w-8 items-center justify-center rounded-full border border-border/50 text-destructive shadow-md transition-all duration-200 hover:scale-105 hover:border-destructive/80 hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-destructive focus-visible:outline-none md:h-9 md:w-9"
              aria-label={`Delete ${type}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="glass flex h-8 w-8 items-center justify-center rounded-full border border-border/50 text-muted-foreground shadow-md transition-all duration-200 hover:scale-105 hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none md:h-9 md:w-9"
            aria-label="Cancel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <ImageCropDialog
        isOpen={isCropOpen}
        isProcessing={isUploading}
        imageSrc={selectedFileUrl}
        aspectRatio={aspectRatio}
        cropShape={cropShape}
        title={cropTitle || `Crop ${type === "avatar" ? "Avatar" : "Banner"}`}
        onCancel={handleCancelCrop}
        onConfirm={handleConfirmCrop}
      />
    </div>
  );
}
