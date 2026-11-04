"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import type { MediaType } from "@tsuki/api/types";
import { useSession } from "@tsuki/auth/client";

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
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const userId = session?.user?.id ?? null;
  const route = apiClient.me.library({ type: mediaType })({
    id: mediaId,
  }).sessions;
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
    setSavingId(id);
    try {
      await changeProgressSessionAction(mediaType, mediaId, id, body);
      await client.invalidateQueries();
      setDeletingId(null);
      toast.success(body ? "Progress history updated" : "Progress history removed");
    } catch {
      toast.error("Could not save history. Check the range for overlaps.");
    } finally {
      setSavingId(null);
    }
  }
  const unit = mediaType === "ANIME" ? "Episode" : "Chapter";
  return (
    <details className="group border-t pt-4">
      <summary className="flex cursor-pointer list-none items-center gap-1 text-sm text-muted-foreground hover:text-foreground marker:content-none">
        Progress history
        <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-3 pt-4">
        <p className="text-xs text-muted-foreground">Changes here save separately from your log.</p>
        {query.isLoading && <p className="text-sm text-muted-foreground">Loading history…</p>}
        {query.isError && <p className="text-sm text-destructive">Could not load history.</p>}
        {query.data?.length === 0 && (
          <p className="text-sm text-muted-foreground">No progress logged yet.</p>
        )}
        {query.data?.map((item) => (
          <form
            key={`${item.id}:${item.updatedAt}`}
            className="space-y-3 rounded-lg bg-muted/40 p-3"
            onSubmit={(event) => {
              event.preventDefault();
              const values = new FormData(event.currentTarget);
              void save(item.id, {
                start: Number(values.get("start")),
                end: Number(values.get("end")),
                activityDate: String(values.get("date")) || null,
              });
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1.5 text-xs font-medium">
                First {unit.toLowerCase()}
                <Input name="start" type="number" min={1} required defaultValue={item.start} />
              </label>
              <label className="space-y-1.5 text-xs font-medium">
                Last {unit.toLowerCase()}
                <Input name="end" type="number" min={1} required defaultValue={item.end} />
              </label>
            </div>
            <label className="block space-y-1.5 text-xs font-medium">
              {mediaType === "ANIME" ? "Watched on" : "Read on"}{" "}
              <span className="font-normal text-muted-foreground">· Leave blank if unknown</span>
              <Input
                name="date"
                type="date"
                max={localDay()}
                defaultValue={item.activityDate ?? ""}
              />
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" type="submit" disabled={savingId !== null}>
                {savingId === item.id && <LoaderCircle className="animate-spin" />}
                Save changes
              </Button>
              {deletingId === item.id ? (
                <>
                  <span className="text-xs text-muted-foreground">Remove this history?</span>
                  <Button
                    size="sm"
                    variant="destructive"
                    type="button"
                    disabled={savingId !== null}
                    onClick={() => void save(item.id, null)}
                  >
                    Remove
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    type="button"
                    onClick={() => setDeletingId(null)}
                  >
                    Keep
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  type="button"
                  onClick={() => setDeletingId(item.id)}
                >
                  Remove
                </Button>
              )}
            </div>
          </form>
        ))}
      </div>
    </details>
  );
}
