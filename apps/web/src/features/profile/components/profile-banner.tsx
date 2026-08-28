"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, ImagePlus, LoaderCircle, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { apiClient } from "@/shared/lib/api-client";
import { cn } from "@/shared/lib/utils";

import { updateProfile } from "../actions";
import { uploadBlobToImageKit, validateProfileImageFile } from "../image-utils";
import { ImageCropDialog } from "./image-crop-dialog";

type ProfileBannerProps = {
  bannerImage?: string | null;
  className?: string;
  isOwner?: boolean;
};

export function ProfileBanner({ bannerImage, className, isOwner = false }: ProfileBannerProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateProfileImageFile(file, "banner");
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
        toast.error("Failed to get upload authorization. Please try again.");
        setIsUploading(false);
        return;
      }

      // 2. Upload blob directly to ImageKit
      const fileName = `banner-${Date.now()}.webp`;
      const uploadResult = await uploadBlobToImageKit({
        blob,
        fileName,
        folder: "/banners",
        auth: {
          token: auth.token,
          expire: auth.expire,
          signature: auth.signature,
          publicKey: auth.publicKey,
        },
      });

      // 3. Persist new banner URL to profile record
      const result = await updateProfile({ bannerImage: uploadResult.url });
      if (!result.success) {
        toast.error(result.error || "Failed to update banner.");
        return;
      }

      toast.success("Banner updated successfully");
      handleCancelCrop();
      router.refresh();
    } catch (err) {
      console.error("Banner upload error:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "An error occurred while uploading your banner. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveBanner = async () => {
    setIsUploading(true);
    try {
      const result = await updateProfile({ bannerImage: null });
      if (!result.success) {
        toast.error(result.error || "Failed to remove banner.");
        return;
      }

      toast.success("Banner removed");
      router.refresh();
    } catch {
      toast.error("Failed to remove banner.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className={cn(
        "group/banner relative mb-6 w-full overflow-hidden rounded-2xl border",
        className,
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
        aria-label="Upload profile banner"
      />

      {bannerImage ? (
        <div className="relative h-48 w-full overflow-hidden shadow-sm md:h-64">
          <Image
            src={bannerImage}
            alt="Banner"
            fill
            priority
            unoptimized
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
        </div>
      ) : (
        <div className="h-32 w-full bg-gradient-to-tr from-muted/50 via-muted/20 to-muted/50 md:h-48" />
      )}

      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs z-20">
          <LoaderCircle className="h-8 w-8 animate-spin text-white" />
        </div>
      )}

      {isOwner && !isUploading && (
        <div className="absolute top-3 right-3 z-10 opacity-0 transition-opacity duration-200 group-hover/banner:opacity-100 focus-within:opacity-100 md:top-4 md:right-4">
          {bannerImage ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="rounded-full bg-background/80 backdrop-blur-md shadow-xs transition-colors hover:bg-background"
                  >
                    <Camera data-icon="inline-start" />
                    Change Banner
                  </Button>
                }
              />
              <DropdownMenuContent align="end" side="bottom" sideOffset={6} className="w-44">
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4" />
                  <span>Upload New Banner</span>
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={handleRemoveBanner}>
                  <Trash2 className="h-4 w-4" />
                  <span>Remove Banner</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="rounded-full bg-background/80 backdrop-blur-md shadow-xs transition-colors hover:bg-background"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus data-icon="inline-start" />
              Add Banner
            </Button>
          )}
        </div>
      )}

      <ImageCropDialog
        isOpen={isCropOpen}
        isProcessing={isUploading}
        imageSrc={selectedFileUrl}
        aspectRatio={3}
        cropShape="rect"
        title="Crop Profile Banner"
        onCancel={handleCancelCrop}
        onConfirm={handleConfirmCrop}
      />
    </div>
  );
}
