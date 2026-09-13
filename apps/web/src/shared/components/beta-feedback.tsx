"use client";

import { useState } from "react";
import { Heart, Info, Mail } from "lucide-react";

import { getSocialPreset, SocialIcon } from "@/features/profile/social-presets";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

const REPO_URL = "https://github.com/d1rshan/tsuki";
const ISSUES_URL = "https://github.com/d1rshan/tsuki/issues";
const DISCORD_URL = "https://discord.gg/22rFFr8n";
const EMAIL_URL = "mailto:darshan.paccha@gmail.com";
const SPONSORS_URL = "https://github.com/sponsors/d1rshan";

function BrandIcon({ platform, className }: { platform: string; className?: string }) {
  const preset = getSocialPreset(platform);
  return preset ? <SocialIcon preset={preset} className={className} /> : null;
}

function LinkButton({
  href,
  label,
  external = true,
  children,
}: {
  href: string;
  label: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <a
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            aria-label={label}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-muted/50 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function BetaFeedback() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            type="button"
            aria-label="Tsuki is in beta, send feedback"
            className="fixed right-4 bottom-4 z-40 flex items-center gap-1.5 rounded-full border border-black/5 glass px-3.5 py-2 text-sm font-medium shadow-2xl outline-none transition-colors hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 dark:border-white/10 md:right-6 md:bottom-6"
          />
        }
      >
        <Info className="size-4" />
        <span>NOTICE</span>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tsuki&apos;s still in beta</DialogTitle>
          <DialogDescription>
            Hey! I&apos;m a student building Tsuki solo in my spare time. My goal is to make Tsuki
            the best open source anime and manga tracking platform out there.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <div className="space-y-2.5">
            <p className="text-sm font-medium text-foreground">Found a bug or have an idea?</p>
            <p className="text-sm text-muted-foreground">
              Doesn&apos;t matter how small, a typo, a button that feels off, a feature you wish
              existed, anything. Let me know and I&apos;ll get on it.
            </p>
            <TooltipProvider>
              <div className="flex flex-wrap gap-2.5">
                <LinkButton href={ISSUES_URL} label="Open a GitHub issue">
                  <BrandIcon platform="github" className="h-4 w-4" />
                </LinkButton>
                <LinkButton href={DISCORD_URL} label="Message me on Discord">
                  <BrandIcon platform="discord" className="h-4 w-4" />
                </LinkButton>
                <LinkButton href={EMAIL_URL} label="Email me" external={false}>
                  <Mail className="h-4 w-4" />
                </LinkButton>
              </div>
            </TooltipProvider>
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-medium text-foreground">Want to contribute?</p>
            <p className="text-sm text-muted-foreground">
              Tsuki is on{" "}
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline underline-offset-3 transition-colors hover:text-primary"
              >
                github
              </a>
              , so if you&apos;re a dev and want to jump in, PRs are always welcome.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
          <p className="text-sm font-medium text-foreground">Support Tsuki</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Any kind of support, even small, means a lot to me and helps me keep this going.
          </p>
          <Button
            render={<a href={SPONSORS_URL} target="_blank" rel="noopener noreferrer" />}
            className="mt-3 w-full"
          >
            <Heart className="size-4" />
            Sponsor on GitHub
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
