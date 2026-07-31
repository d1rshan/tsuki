import { DiscoverView } from "@/modules/discover/components/discover-view";
import { getTrending } from "@/modules/media/queries";

export default async function HomePage() {
  const [anime, manga] = await Promise.all([getTrending("ANIME"), getTrending("MANGA")]);

  return <DiscoverView trending={{ ANIME: anime, MANGA: manga }} />;
}
