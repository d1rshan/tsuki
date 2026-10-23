"use client";

import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/components/ui/dialog";

export function LoginModal({ children, mode }: { children: React.ReactNode; mode?: string }) {
  const router = useRouter();

  return (
    <Dialog open onOpenChange={(open) => !open && router.back()}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-background/25 supports-backdrop-filter:backdrop-blur-[3px]"
        className="max-h-[calc(100dvh-2rem)] max-w-sm overflow-y-auto rounded-xl border-0 !bg-transparent p-0 shadow-none ring-0 !backdrop-blur-none"
      >
        <DialogTitle className="sr-only">
          {mode === "signup" ? "Create an account" : "Sign in"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Sign in or create a Tsuki account.
        </DialogDescription>
        {children}
      </DialogContent>
    </Dialog>
  );
}
