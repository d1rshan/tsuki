export type OgCardLayout =
  | {
      variant: "banner";
      kicker: string;
      titleNative: string | null;
      title: string;
      bannerUrl: string;
      coverUrl: string | null;
    }
  | {
      variant: "fallback";
      kicker: string;
      titleNative: string | null;
      title: string;
      coverUrl: string;
    }
  | {
      variant: "profile";
      title: string;
      description: string | null;
      avatarUrl: string | null;
      bannerUrl: string | null;
    }
  | {
      variant: "minimal";
      title: string;
      description: string | null;
    };

type MediaOgInput = {
  title: string;
  titleNative?: string | null;
  type: "ANIME" | "MANGA";
  bannerImage: string | null;
  coverImage: string | null;
  hasBannerImage?: boolean;
};

/**
 * The one branching decision in OG image generation: which card layout a given
 * input gets. Pure so it can be tested without touching Satori.
 */
export function buildMediaOgCard({
  title,
  titleNative,
  type,
  bannerImage,
  coverImage,
  hasBannerImage = Boolean(bannerImage),
}: MediaOgInput): OgCardLayout {
  if (bannerImage && hasBannerImage) {
    return {
      variant: "banner",
      kicker: type === "ANIME" ? "Anime" : "Manga",
      title,
      titleNative:
        titleNative && titleNative.toLocaleLowerCase() !== title.toLocaleLowerCase()
          ? titleNative
          : null,
      bannerUrl: bannerImage,
      coverUrl: coverImage,
    };
  }

  // Same treatment as the in-app media banner: cover scaled up and blurred
  // behind a gradient, so cards stay intentional without banner art.
  return {
    variant: "fallback",
    kicker: type === "ANIME" ? "Anime" : "Manga",
    title,
    titleNative:
      titleNative && titleNative.toLocaleLowerCase() !== title.toLocaleLowerCase()
        ? titleNative
        : null,
    coverUrl: coverImage ?? "",
  };
}

export function buildMinimalOgCard(title: string, description: string | null): OgCardLayout {
  return { variant: "minimal", title, description };
}

export function buildProfileOgCard(profile: {
  displayUsername: string;
  bio: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
}): OgCardLayout {
  return {
    variant: "profile",
    title: profile.displayUsername,
    description: profile.bio,
    avatarUrl: profile.avatarUrl ?? null,
    bannerUrl: profile.bannerUrl ?? null,
  };
}
