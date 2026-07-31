import { MediaPage } from "@/modules/media/components/media-page";

export default function AnimePage({ params }: { params: Promise<{ id: string }> }) {
  return <MediaPage mediaType="ANIME" params={params} />;
}
