"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useSession } from "@tsuki/auth/client";
import type { MediaType } from "@tsuki/api/types";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { apiClient } from "@/shared/lib/api-client";

import { changeProgressSessionAction } from "../actions";
import { localDay } from "../activity";
import { mediaKeys } from "../query-keys";

export function ProgressSessions({
  mediaType,
  mediaId,
}: {
  mediaType: MediaType;
  mediaId: number;
}) {
  const client = useQueryClient();
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id ?? null;
  const route = apiClient.me.library({ type: mediaType })({ id: mediaId }).sessions;
  const query = useQuery({
    queryKey: mediaKeys.sessions(mediaType, mediaId, userId),
    enabled: !isPending && Boolean(userId),
    queryFn: async () => {
      const { data, error } = await route.get();
      if (error) throw error;
      return data;
    },
  });
  async function save(
    id: string,
    body: { start: number; end: number; activityDate: string | null } | null,
  ) {
    try {
      await changeProgressSessionAction(mediaType, mediaId, id, body);
      await client.invalidateQueries();
      toast.success("Progress session updated");
    } catch {
      toast.error("Could not save session. Check the range for overlaps.");
    }
  }
  return (
    <details>
      <summary>Progress sessions</summary>
      {query.isError && <p>Could not load sessions.</p>}
      {query.data?.length === 0 && <p>No progress sessions.</p>}
      {query.data?.map((session) => (
        <form
          key={`${session.id}:${session.updatedAt}`}
          className="my-3 space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            const values = new FormData(event.currentTarget);
            void save(session.id, {
              start: Number(values.get("start")),
              end: Number(values.get("end")),
              activityDate: String(values.get("date")) || null,
            });
          }}
        >
          <div className="flex gap-2">
            <Input
              aria-label="First episode or chapter"
              name="start"
              type="number"
              min={1}
              required
              defaultValue={session.start}
            />
            <Input
              aria-label="Last episode or chapter"
              name="end"
              type="number"
              min={1}
              required
              defaultValue={session.end}
            />
          </div>
          <Input
            aria-label={mediaType === "ANIME" ? "Watched on" : "Read on"}
            name="date"
            type="date"
            max={localDay()}
            defaultValue={session.activityDate ?? ""}
          />
          <p className="text-xs text-muted-foreground">Leave date blank if you don’t remember.</p>
          <Button size="sm" type="submit">
            Save session
          </Button>{" "}
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() => void save(session.id, null)}
          >
            Delete session
          </Button>
        </form>
      ))}
    </details>
  );
}
