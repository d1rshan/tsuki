import { ErrorState } from "@/components/states";
import { DiscoverView } from "@/modules/discover/components/discover-view";
import { getTrending } from "@/modules/media/queries";

export default async function HomePage() {
  const [anime, manga] = await Promise.all([getTrending("ANIME"), getTrending("MANGA")]);

  if (anime.error || manga.error) {
    return <ErrorState message="Failed to load discover" description="Please try again later." />;
  }

  return <DiscoverView trending={{ ANIME: anime.data, MANGA: manga.data }} />;
}
