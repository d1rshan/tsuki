"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { cn } from "@/shared/lib/utils";

import { updateProfile } from "../actions";
import { ProfileImageControls } from "./profile-image-controls";

type ProfileBannerProps = {
  bannerImage?: string | null;
  className?: string;
  isOwner?: boolean;
};

export function ProfileBanner({ bannerImage, className, isOwner = false }: ProfileBannerProps) {
  const router = useRouter();

  const handleUploadSuccess = async (url: string, fileId: string) => {
    const result = await updateProfile({ bannerImage: url, bannerFileId: fileId });
    if (!result.success) {
      toast.error(result.error || "Failed to update banner.");
      return;
    }
    toast.success("Banner updated");
    router.refresh();
  };

  const handleRemoveBanner = async () => {
    const result = await updateProfile({ bannerImage: null });
    if (!result.success) {
      toast.error(result.error || "Failed to remove banner.");
      return;
    }
    toast.success("Banner removed");
    router.refresh();
  };

  return (
    <div
      className={cn(
        "group/banner relative mb-6 w-full overflow-hidden rounded-2xl border",
        className,
      )}
    >
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
        <div className="h-48 w-full bg-gradient-to-tr from-muted/50 via-muted/20 to-muted/50 md:h-64" />
      )}

      {isOwner && (
        <div className="absolute top-3 right-3 z-10 opacity-0 transition-opacity duration-200 group-hover/banner:opacity-100 focus-within:opacity-100 md:top-4 md:right-4">
          <ProfileImageControls
            type="banner"
            aspectRatio={3}
            cropShape="rect"
            uploadFolder="/banners"
            hasImage={Boolean(bannerImage)}
            onUploadSuccess={handleUploadSuccess}
            onRemove={handleRemoveBanner}
          />
        </div>
      )}
    </div>
  );
}
