"use client";

import { useRef, useState } from "react";
import { ImageUp, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { apiClient } from "@/shared/lib/api-client";
import { cn } from "@/shared/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

import {
  type ImageUploadType,
  uploadBlobToImageKit,
  validateProfileImageFile,
} from "../image-utils";
import { ImageCropDialog } from "./image-crop-dialog";

type ProfileImageControlsProps = {
  align?: "start" | "end";
  aspectRatio: number;
  className?: string;
  cropShape?: "round" | "rect";
  hasImage: boolean;
  onRemove: () => void;
  onUploadSuccess: (url: string) => void;
  type: ImageUploadType;
};

/** Pencil trigger that opens a menu of image actions (Discord-style). */
export function ProfileImageControls({
  align = "end",
  aspectRatio,
  className,
  cropShape = "rect",
  hasImage,
  onRemove,
  onUploadSuccess,
  type,
}: ProfileImageControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateProfileImageFile(file, type);
    if (!validation.valid) {
      toast.error(validation.error);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFileUrl(URL.createObjectURL(file));
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
      const { data: auth, error } = await apiClient.me.profile["upload-auth"].get({
        query: { type },
      });
      if (error || !auth) {
        toast.error("Failed to get upload authorization. Please try again.");
        setIsUploading(false);
        return;
      }

      const uploadResult = await uploadBlobToImageKit({ blob, auth });

      onUploadSuccess(uploadResult.url);
      handleCancelCrop();
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn("inline-flex", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
        aria-label={`Upload ${type}`}
      />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="glass flex h-8 w-8 items-center justify-center rounded-full border border-border/50 text-foreground shadow-md transition-colors hover:border-primary/50 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none md:h-9 md:w-9"
              aria-label={`Edit ${type}`}
            >
              <Pencil className="h-4 w-4" />
            </button>
          }
        />
        <DropdownMenuContent align={align}>
          <DropdownMenuItem onSelect={() => fileInputRef.current?.click()}>
            <ImageUp />
            Upload
          </DropdownMenuItem>
          {hasImage && (
            <DropdownMenuItem variant="destructive" onSelect={onRemove}>
              <Trash2 />
              Remove
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ImageCropDialog
        isOpen={isCropOpen}
        isProcessing={isUploading}
        imageSrc={selectedFileUrl}
        aspectRatio={aspectRatio}
        cropShape={cropShape}
        title={`Crop ${type === "avatar" ? "Avatar" : "Banner"}`}
        onCancel={handleCancelCrop}
        onConfirm={handleConfirmCrop}
      />
    </div>
  );
}
