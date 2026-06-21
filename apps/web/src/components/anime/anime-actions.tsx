import { auth } from "@/lib/auth";
import { serverApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { AnimeActionsClient } from "@/components/anime/anime-actions-client";

export async function AnimeActions({ animeId }: { animeId: number }) {
  const { user } = await auth();

  if (!user || !user.username) {
    // TODO: this should just be !user
    return (
      <Button variant="secondary" className="w-full opacity-50 cursor-not-allowed">
        Login to Log Anime
      </Button>
    );
  }

  const api = await serverApi();
  const res = await api.users.me.activity({ animeId }).get(); // TODO: do we cache this?

  if (res.error) {
    return null;
  }

  return (
    <AnimeActionsClient
      animeId={animeId}
      entry={res.data.entry}
      review={res.data.review}
      username={user.username}
    />
  );
}
