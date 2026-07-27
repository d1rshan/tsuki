import { ErrorState } from "@/components/states";
import { DiscoverView } from "@/modules/discover/components/discover-view";
import { getTrending } from "@/modules/media/queries";

export default async function HomePage() {
  const [anime, manga] = await Promise.all([getTrending("anime"), getTrending("manga")]);

  if (anime.error || manga.error) {
    return <ErrorState message="Failed to load discover" description="Please try again later." />;
  }

  return <DiscoverView trending={{ anime: anime.data, manga: manga.data }} />;
}
