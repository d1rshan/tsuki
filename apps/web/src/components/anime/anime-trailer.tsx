import { PlayCircle } from "lucide-react";

// import { Backlight } from "@/components/ui/backlight";

// TODO: use backlight for the trailer
export function AnimeTrailer({ trailerId }: { trailerId: string }) {
  return (
    <div className="pt-8 space-y-4">
      <div className="flex items-center gap-2">
        <PlayCircle className="size-5 text-primary" />
        <h2 className="text-xl font-semibold tracking-tight">Trailer</h2>
      </div>

      {/* <Backlight blur={25} className="w-full"> */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl shadow-md">
        <iframe
          key={trailerId}
          src={`https://www.youtube.com/embed/${trailerId}?rel=0`}
          title="Anime Trailer"
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      {/* </Backlight> */}
    </div>
  );
}
