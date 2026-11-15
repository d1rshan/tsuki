import { ProfileMedia } from "./profile-media";

export function ProfileBanner({ bannerImage }: { bannerImage?: string | null }) {
  return (
    <div className="relative left-1/2 h-[250px] w-dvw -translate-x-1/2 overflow-hidden bg-muted md:h-[350px]">
      {bannerImage && <ProfileMedia src={bannerImage} alt="Profile banner" />}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
    </div>
  );
}
