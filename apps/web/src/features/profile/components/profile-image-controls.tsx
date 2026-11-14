"use client";

import { useEffect, useRef, useState } from "react";
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
  type PixelCrop,
  isAnimatedWebP,
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
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);

  useEffect(
    () => () => {
      if (selectedFileUrl) URL.revokeObjectURL(selectedFileUrl);
    },
    [selectedFileUrl],
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateProfileImageFile(file, type);
    if (!validation.valid) {
      toast.error(validation.error);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (
      file.type === "image/webp" &&
      isAnimatedWebP(new Uint8Array(await file.slice(0, 32).arrayBuffer()))
    ) {
      toast.error("Animated WebP is not supported. Choose a GIF or MP4 instead.", {
        position: "top-center",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setFile(file);
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

  const handleConfirmCrop = async (crop: PixelCrop, start: number, duration: number) => {
    if (!file) return;
    setIsUploading(true);
    let fileId: string | undefined;
    try {
      setProgress("Uploading media…");
      const extension = (
        {
          "image/jpeg": "jpg",
          "image/png": "png",
          "image/webp": "webp",
          "image/gif": "gif",
          "video/mp4": "mp4",
        } as const
      )[file.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif" | "video/mp4"];
      const { data: auth, error } = await apiClient.me.profile["upload-auth"].get({
        query: { type, extension },
      });
      if (error || !auth) throw new Error("Could not authorize upload. Please retry.");
      const upload = await uploadBlobToImageKit({ blob: file, auth });
      fileId = upload.fileId;
      setProgress("Preparing your media…");
      const deadline = Date.now() + 180000;
      while (Date.now() < deadline) {
        const { data, error: processingError } = await apiClient.me.profile["process-media"].post({
          fileId,
          type,
          crop,
          start,
          duration,
        });
        if (processingError || !data)
          throw new Error(
            processingError?.value && "error" in processingError.value
              ? String(processingError.value.error)
              : "Could not process media. Please retry.",
          );
        if (data.url) {
          fileId = undefined;
          onUploadSuccess(data.url);
          handleCancelCrop();
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      throw new Error("Processing took too long. Please try again.");
    } finally {
      if (fileId) {
        try {
          await apiClient.me.profile["source-upload"].delete({ fileId, type });
        } catch {
          /* GC retries cleanup if the network is unavailable. */
        }
      }
      setIsUploading(false);
      setProgress("");
    }
  };

  return (
    <div className={cn("inline-flex", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4"
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
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
            <ImageUp />
            Upload
          </DropdownMenuItem>
          {hasImage && (
            <DropdownMenuItem variant="destructive" onClick={onRemove}>
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
        file={file}
        aspectRatio={aspectRatio}
        cropShape={cropShape}
        title={`Adjust ${type}`}
        progress={progress}
        onReplace={() => fileInputRef.current?.click()}
        onCancel={handleCancelCrop}
        onConfirm={handleConfirmCrop}
      />
    </div>
  );
}
