"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { apiClient } from "@/shared/lib/api-client";
import { cn } from "@/shared/lib/utils";

import {
  type ImageUploadType,
  uploadBlobToImageKit,
  validateProfileImageFile,
} from "../image-utils";
import { ImageCropDialog } from "./image-crop-dialog";

type ProfileImageUploaderProps = {
  className?: string;
  currentImageUrl?: string | null;
  disabled?: boolean;
  initials?: string;
  onImageChange: (data: { fileId?: string | null; url: string | null }) => void;
  type: ImageUploadType;
};

export function ProfileImageUploader({
  className,
  currentImageUrl,
  disabled = false,
  initials = "U",
  onImageChange,
  type,
}: ProfileImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const isAvatar = type === "avatar";
  const aspectRatio = isAvatar ? 1 : 3; // 1:1 for avatar, 3:1 for banner

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
      // 1. Fetch upload authorization from Elysia API
      const { data: auth, error } = await apiClient.me.profile["upload-auth"].get();
      if (error || !auth) {
        toast.error("Failed to get upload authorization. Please ensure you are signed in.");
        setIsUploading(false);
        return;
      }

      // 2. Upload blob directly to ImageKit from the browser
      const fileName = `${type}-${Date.now()}.webp`;
      const folder = `/${type}s`;

      const uploadResult = await uploadBlobToImageKit({
        blob,
        fileName,
        folder,
        auth: {
          token: auth.token,
          expire: auth.expire,
          signature: auth.signature,
          publicKey: auth.publicKey,
        },
      });

      // 3. Notify parent component with new image URL and file ID
      onImageChange({
        url: uploadResult.url,
        fileId: uploadResult.fileId,
      });

      toast.success(`${isAvatar ? "Avatar" : "Banner"} ready to save`);
      handleCancelCrop();
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "An error occurred while uploading the image. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onImageChange({ url: null, fileId: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.info(`${isAvatar ? "Avatar" : "Banner"} removed`);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        aria-label={`Upload ${type}`}
      />

      {isAvatar ? (
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border bg-muted ring-2 ring-background shadow-xs">
            {currentImageUrl ? (
              <Image
                src={currentImageUrl}
                alt="Avatar preview"
                fill
                priority
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-xl font-medium text-muted-foreground">
                {initials.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera data-icon="inline-start" />
              {currentImageUrl ? "Change Avatar" : "Upload Avatar"}
            </Button>

            {currentImageUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={disabled || isUploading}
                onClick={handleRemove}
              >
                <Trash2 data-icon="inline-start" />
                Remove
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="relative h-28 w-full overflow-hidden rounded-xl border bg-muted shadow-xs">
            {currentImageUrl ? (
              <Image
                src={currentImageUrl}
                alt="Banner preview"
                fill
                priority
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-tr from-muted/60 via-muted/30 to-muted/60" />
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus data-icon="inline-start" />
              {currentImageUrl ? "Change Banner" : "Upload Banner"}
            </Button>

            {currentImageUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={disabled || isUploading}
                onClick={handleRemove}
              >
                <Trash2 data-icon="inline-start" />
                Remove
              </Button>
            )}
          </div>
        </div>
      )}

      <ImageCropDialog
        isOpen={isCropOpen}
        isProcessing={isUploading}
        imageSrc={selectedFileUrl}
        aspectRatio={aspectRatio}
        cropShape={isAvatar ? "round" : "rect"}
        title={isAvatar ? "Crop Profile Avatar" : "Crop Profile Banner"}
        onCancel={handleCancelCrop}
        onConfirm={handleConfirmCrop}
      />
    </div>
  );
}
