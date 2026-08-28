"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, LoaderCircle, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import type { UserOverview } from "@tsuki/api/types";

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

type ProfileAvatarProps = {
  className?: string;
  isOwner?: boolean;
  user: UserOverview["user"];
};

export function ProfileAvatar({ className, isOwner = false, user }: ProfileAvatarProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateProfileImageFile(file, "avatar");
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
      const fileName = `avatar-${Date.now()}.webp`;
      const uploadResult = await uploadBlobToImageKit({
        blob,
        fileName,
        folder: "/avatars",
        auth: {
          token: auth.token,
          expire: auth.expire,
          signature: auth.signature,
          publicKey: auth.publicKey,
        },
      });

      // 3. Persist new avatar URL to user record
      const result = await updateProfile({ image: uploadResult.url });
      if (!result.success) {
        toast.error(result.error || "Failed to update avatar.");
        return;
      }

      toast.success("Avatar updated successfully");
      handleCancelCrop();
      router.refresh();
    } catch (err) {
      console.error("Avatar upload error:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "An error occurred while uploading your avatar. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setIsUploading(true);
    try {
      const result = await updateProfile({ image: null });
      if (!result.success) {
        toast.error(result.error || "Failed to remove avatar.");
        return;
      }

      toast.success("Avatar removed");
      router.refresh();
    } catch {
      toast.error("Failed to remove avatar.");
    } finally {
      setIsUploading(false);
    }
  };

  const avatarContent = (
    <div
      className={cn(
        "relative h-24 w-24 overflow-hidden rounded-full border bg-muted ring-4 ring-background shadow-sm md:h-32 md:w-32",
        isOwner && "group/avatar cursor-pointer",
        className,
      )}
    >
      {user.image ? (
        <Image
          src={user.image}
          alt={user.name}
          fill
          priority
          sizes="(max-width: 768px) 96px, 128px"
          className="object-cover"
        />
      ) : (
        <div className="grid h-full w-full place-items-center text-3xl font-medium text-muted-foreground">
          {user.displayUsername.charAt(0).toUpperCase()}
        </div>
      )}

      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <LoaderCircle className="h-6 w-6 animate-spin text-white" />
        </div>
      )}

      {isOwner && !isUploading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity duration-200 group-hover/avatar:opacity-100 group-focus-visible/avatar:opacity-100">
          <Camera className="h-5 w-5 text-white md:h-6 md:w-6" />
          <span className="text-[10px] font-medium text-white/90 uppercase tracking-wider md:text-xs">
            Edit
          </span>
        </div>
      )}
    </div>
  );

  if (!isOwner) {
    return avatarContent;
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
        aria-label="Upload profile avatar"
      />

      <DropdownMenu>
        <DropdownMenuTrigger render={avatarContent} />
        <DropdownMenuContent align="start" side="bottom" sideOffset={8} className="w-44">
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" />
            <span>{user.image ? "Change Avatar" : "Upload Avatar"}</span>
          </DropdownMenuItem>
          {user.image && (
            <DropdownMenuItem variant="destructive" onClick={handleRemoveAvatar}>
              <Trash2 className="h-4 w-4" />
              <span>Remove Avatar</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ImageCropDialog
        isOpen={isCropOpen}
        isProcessing={isUploading}
        imageSrc={selectedFileUrl}
        aspectRatio={1}
        cropShape="round"
        title="Crop Profile Avatar"
        onCancel={handleCancelCrop}
        onConfirm={handleConfirmCrop}
      />
    </>
  );
}
