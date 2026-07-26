import { type MangaCompact } from "@/lib/types";

import { MangaCard } from "./manga-card";

export function MangaGrid({ mangas }: { mangas: MangaCompact[] }) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {mangas.map((manga) => (
        <MangaCard key={manga.id} manga={manga} />
      ))}
    </div>
  );
}
