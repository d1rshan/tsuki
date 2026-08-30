"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { UserOverview } from "@tsuki/api/types";

import { cn } from "@/shared/lib/utils";

import { updateProfile } from "../actions";
import { ProfileImageControls } from "./profile-image-controls";

type ProfileAvatarProps = {
  className?: string;
  isOwner?: boolean;
  user: UserOverview["user"];
};

export function ProfileAvatar({ className, isOwner = false, user }: ProfileAvatarProps) {
  const router = useRouter();

  const handleUploadSuccess = async (url: string, fileId: string) => {
    const result = await updateProfile({ image: url, avatarFileId: fileId });
    if (!result.success) {
      toast.error(result.error || "Failed to update avatar.");
      return;
    }
    toast.success("Avatar updated");
    router.refresh();
  };

  const handleRemoveAvatar = async () => {
    const result = await updateProfile({ image: null });
    if (!result.success) {
      toast.error(result.error || "Failed to remove avatar.");
      return;
    }
    toast.success("Avatar removed");
    router.refresh();
  };

  return (
    <div
      className={cn(
        "group/avatar relative h-24 w-24 overflow-hidden rounded-full border bg-muted ring-4 ring-background shadow-sm md:h-32 md:w-32",
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

      {isOwner && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover/avatar:opacity-100 focus-within:opacity-100">
          <ProfileImageControls
            type="avatar"
            aspectRatio={1}
            cropShape="round"
            uploadFolder="/avatars"
            hasImage={Boolean(user.image)}
            onUploadSuccess={handleUploadSuccess}
            onRemove={handleRemoveAvatar}
          />
        </div>
      )}
    </div>
  );
}
