import type { LucideIcon } from "lucide-react";

import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

export function AuthStatus({
  actions,
  description,
  icon: Icon,
  title,
}: {
  actions: React.ReactNode;
  description: readonly [string, string?];
  icon: LucideIcon;
  title: string;
}) {
  return (
    <>
      <DialogHeader>
        <Icon className="size-5" aria-hidden="true" />
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description.filter(Boolean).join(" ")}</DialogDescription>
      </DialogHeader>
      <DialogFooter className="border-0 bg-transparent pt-0 sm:flex-col-reverse">
        {actions}
      </DialogFooter>
    </>
  );
}
