import { Link as LinkIcon } from "lucide-react";

import type { UserOverview } from "@tsuki/api/types";

import { RichContentView } from "@/features/rich-content/components/rich-content-view";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

import { cn } from "@/shared/lib/utils";

import { BENTO_CARD } from "./profile-section";
import { getSocialPreset, SocialIcon } from "../social-presets";

type Profile = UserOverview["profile"];

export function ProfileBioCard({ className, profile }: { className?: string; profile: Profile }) {
  const socialLinks = profile?.socialLinks;
  const hasBio = Boolean(profile?.bio);

  return (
    <div className={cn(BENTO_CARD, "flex flex-col p-5 sm:p-6", className)}>
      {hasBio && (
        <RichContentView
          content={profile?.bio}
          mode="compact"
          className="mt-3 text-sm leading-relaxed text-foreground/80"
        />
      )}

      {socialLinks && Object.keys(socialLinks).length > 0 && (
        <div className={cn("flex flex-wrap gap-2.5", hasBio ? "mt-auto pt-6" : "mt-2")}>
          <TooltipProvider>
            {Object.entries(socialLinks).map(([platform, url]) => {
              const preset = getSocialPreset(platform);
              const name = preset?.label ?? platform;

              return (
                <Tooltip key={platform}>
                  <TooltipTrigger
                    render={
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={name}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-muted/50 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                      />
                    }
                  >
                    {preset ? (
                      <SocialIcon preset={preset} className="h-4 w-4" />
                    ) : (
                      <LinkIcon className="h-4 w-4" />
                    )}
                  </TooltipTrigger>
                  <TooltipContent>{name}</TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>
      )}
    </div>
  );
}
