"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, LockKeyholeOpen } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";

import { setProfilePrivacy } from "../actions";

export function ProfilePrivacyToggle({ initialValue }: { initialValue: boolean }) {
  const router = useRouter();
  const [isPrivate, setIsPrivate] = useState(initialValue);
  const [pending, setPending] = useState(false);

  async function toggle() {
    setPending(true);
    try {
      const next = !isPrivate;
      const result = await setProfilePrivacy(next);
      if (!result.success) return toast.error(result.error);
      setIsPrivate(next);
      router.refresh();
    } catch {
      toast.error("Failed to update privacy.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      aria-label={isPrivate ? "Make profile public" : "Make profile private"}
      onClick={() => void toggle()}
    >
      {isPrivate ? (
        <LockKeyhole data-icon="inline-start" />
      ) : (
        <LockKeyholeOpen data-icon="inline-start" />
      )}
      {isPrivate ? "Private" : "Public"}
    </Button>
  );
}
