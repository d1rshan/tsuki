import { MediaPage } from "@/modules/media/components/media-page";

export default function MangaPage({ params }: { params: Promise<{ id: string }> }) {
  return <MediaPage mediaType="MANGA" params={params} />;
}
