import { auth } from "@/lib/auth";
import { serverApi } from "@/lib/server-api";
import { AnimeActionsClient } from "@/components/anime/anime-actions-client";

export async function AnimeActions({ animeId }: { animeId: number }) {
  const { user } = await auth();

  let entry = null;
  let review = null;

  if (user && user.username) {
    const api = await serverApi();
    const res = await api.users.me.activity({ animeId }).get(); // TODO: do we cache this?

    if (!res.error) {
      entry = res.data.entry;
      review = res.data.review;
    }
  }

  return (
    <AnimeActionsClient
      animeId={animeId}
      entry={entry}
      review={review}
      isAuthenticated={!!user?.username}
    />
  );
}
