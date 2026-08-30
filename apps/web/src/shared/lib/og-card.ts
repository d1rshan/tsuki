export type OgCardLayout =
  | {
      variant: "banner";
      kicker: string;
      title: string;
      bannerUrl: string;
      coverUrl: string | null;
    }
  | {
      variant: "fallback";
      kicker: string;
      title: string;
      coverUrl: string;
    }
  | {
      variant: "minimal";
      title: string;
      description: string | null;
    };

type MediaOgInput = {
  title: string;
  type: "ANIME" | "MANGA";
  bannerImage: string | null;
  coverImage: string | null;
};

/**
 * The one branching decision in OG image generation: which card layout a given
 * input gets. Pure so it can be tested without touching Satori.
 */
export function buildMediaOgCard({
  title,
  type,
  bannerImage,
  coverImage,
}: MediaOgInput): OgCardLayout {
  if (bannerImage) {
    return {
      variant: "banner",
      kicker: type === "ANIME" ? "Anime" : "Manga",
      title,
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
    coverUrl: coverImage ?? "",
  };
}

export function buildMinimalOgCard(title: string, description: string | null): OgCardLayout {
  return { variant: "minimal", title, description };
}

export function buildProfileOgCard(profile: {
  displayUsername: string;
  bio: string | null;
}): OgCardLayout {
  return buildMinimalOgCard(profile.displayUsername, profile.bio);
}
