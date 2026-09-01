import { Globe } from "lucide-react";
import {
  siDiscord,
  siGithub,
  siInstagram,
  siTwitch,
  siX,
  siYoutube,
  type SimpleIcon,
} from "simple-icons";

export type SocialPreset = {
  /** Lowercase platform key stored in profile.socialLinks */
  value: string;
  label: string;
  /** simple-icons brand path; null renders a Globe (generic URL platforms) */
  icon: SimpleIcon | null;
  /**
   * If set, users only type a handle and the full URL is built from it.
   * Absent for generic URL platforms (e.g. website).
   */
  prefix?: string;
  placeholder: string;
};

export const SOCIAL_PRESETS: SocialPreset[] = [
  { value: "x", label: "X", icon: siX, prefix: "https://x.com/", placeholder: "username" },
  {
    value: "github",
    label: "GitHub",
    icon: siGithub,
    prefix: "https://github.com/",
    placeholder: "username",
  },
  {
    value: "youtube",
    label: "YouTube",
    icon: siYoutube,
    prefix: "https://youtube.com/@",
    placeholder: "handle",
  },
  {
    value: "twitch",
    label: "Twitch",
    icon: siTwitch,
    prefix: "https://twitch.tv/",
    placeholder: "username",
  },
  {
    value: "discord",
    label: "Discord",
    icon: siDiscord,
    prefix: "https://discord.com/users/",
    placeholder: "user ID",
  },
  {
    value: "instagram",
    label: "Instagram",
    icon: siInstagram,
    prefix: "https://instagram.com/",
    placeholder: "username",
  },
  { value: "website", label: "Website", icon: null, placeholder: "d1rshan.me" },
];

export function getSocialPreset(platform: string): SocialPreset | undefined {
  return SOCIAL_PRESETS.find((preset) => preset.value === platform.trim().toLowerCase());
}

export function SocialIcon({ preset, className }: { preset: SocialPreset; className?: string }) {
  if (!preset.icon) {
    return <Globe className={className} aria-hidden="true" />;
  }

  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d={preset.icon.path} />
    </svg>
  );
}
