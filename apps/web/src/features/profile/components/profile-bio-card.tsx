import { Link as LinkIcon } from "lucide-react";

import type { UserOverview } from "@tsuki/api/types";

import { RichContentView } from "@/features/rich-content/components/rich-content-view";

import { cn } from "@/shared/lib/utils";

import { BENTO_CARD } from "./profile-section";

type Profile = UserOverview["profile"];

export function ProfileBioCard({ className, profile }: { className?: string; profile: Profile }) {
  const socialLinks = profile?.socialLinks;

  return (
    <div className={cn(BENTO_CARD, "flex flex-col p-5 sm:p-6", className)}>
      {profile?.bio ? (
        <RichContentView
          content={profile.bio}
          mode="compact"
          className="mt-3 text-sm leading-relaxed text-foreground/80"
        />
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">Nothing here yet.</p>
      )}

      {socialLinks && Object.keys(socialLinks).length > 0 && (
        <div className="mt-auto flex flex-wrap gap-x-4 gap-y-2 pt-6">
          {Object.entries(socialLinks).map(([platform, url]) => (
            <a
              key={platform}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <LinkIcon className="h-4 w-4" />
              <span className="capitalize">{platform}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
