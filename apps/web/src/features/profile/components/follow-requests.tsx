"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { apiClient } from "@/shared/lib/api-client";

export function FollowRequests() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const requests = useQuery({
    queryKey: ["follow-requests"],
    queryFn: async () => {
      const { data, error } = await apiClient.me["follow-requests"].get();
      if (error || !data) throw error ?? new Error("Could not load requests");
      return data;
    },
  });
  const decision = useMutation({
    mutationFn: async ({ username, accept }: { username: string; accept: boolean }) => {
      const endpoint = apiClient.me["follow-requests"]({ username });
      const result = accept ? await endpoint.post() : await endpoint.delete();
      if (result.error) throw result.error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["follow-requests"] });
      router.refresh();
    },
    onError: () => toast.error("Could not update follow request"),
  });

  if (requests.isError)
    return (
      <section className="mb-8 rounded-xl border p-5" aria-label="Follow requests">
        <p role="alert">Could not load follow requests.</p>
        <Button
          type="button"
          variant="outline"
          className="mt-3"
          disabled={requests.isFetching}
          onClick={() => void requests.refetch()}
        >
          Retry
        </Button>
      </section>
    );
  if (!requests.data?.length) return null;
  return (
    <section className="mb-8 rounded-xl border p-5" aria-label="Follow requests">
      <h2 className="mb-4 font-semibold">Follow requests</h2>
      <ul className="space-y-3">
        {requests.data.map((person) => (
          <li key={person.id} className="flex items-center justify-between gap-3">
            <Link
              href={`/${person.username}`}
              prefetch={true}
              className="font-medium hover:underline"
            >
              @{person.displayUsername}
            </Link>
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={decision.isPending}
                onClick={() => decision.mutate({ username: person.username, accept: true })}
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={decision.isPending}
                onClick={() => decision.mutate({ username: person.username, accept: false })}
              >
                Decline
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
