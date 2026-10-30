"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        // Keep dimming without filter support; animate opacity rather than the blur radius.
        "fixed inset-0 isolate z-50 bg-black/40 dark:bg-black/50 supports-backdrop-filter:backdrop-blur-[4px] duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 data-closed:fill-mode-forwards motion-reduce:!animate-none",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  overlayClassName,
  overlayRender,
  mobileSheet = true,
  children,
  ...props
}: DialogPrimitive.Popup.Props & {
  overlayClassName?: string;
  overlayRender?: DialogPrimitive.Backdrop.Props["render"];
  /** Keep the centered dialog presentation on mobile. */
  mobileSheet?: boolean;
}) {
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const drag = React.useRef<{ start: number; distance: number; time: number } | null>(null);

  function finishDrag(event: React.PointerEvent<HTMLDivElement>, cancelled = false) {
    const current = drag.current;
    if (!current) return;
    drag.current = null;
    const popup = event.currentTarget.parentElement;
    popup?.removeAttribute("data-sheet-dragging");
    if (
      !cancelled &&
      (current.distance > 120 || (current.distance > 45 && performance.now() - current.time < 250))
    ) {
      closeRef.current?.click();
      // A controlled dialog can reject the request. Let it settle back in that case;
      // otherwise keep the offset while the closing animation travels downwards.
      requestAnimationFrame(() => {
        if (popup?.hasAttribute("data-open")) popup.style.removeProperty("--sheet-drag");
      });
    } else {
      popup?.style.removeProperty("--sheet-drag");
    }
  }

  return (
    <DialogPortal>
      <DialogOverlay className={overlayClassName} render={overlayRender} />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "fixed z-50 grid w-full gap-4 bg-background p-4 text-sm text-foreground outline-none data-closed:fill-mode-forwards",
          mobileSheet
            ? "bottom-0 left-0 max-sm:max-h-[min(90dvh,calc(100dvh-env(safe-area-inset-top)))] max-w-none translate-y-[var(--sheet-drag,0px)] max-sm:overflow-y-auto rounded-t-xl pt-8 pb-[max(1rem,env(safe-area-inset-bottom))] transition-transform duration-200 data-[sheet-dragging]:duration-0 data-open:animate-in data-open:slide-in-from-bottom data-closed:animate-out data-closed:slide-out-to-bottom motion-reduce:duration-0 motion-reduce:animate-none sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:max-w-sm sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:p-4 sm:data-open:fade-in-0 sm:data-open:zoom-in-95 sm:data-closed:fade-out-0 sm:data-closed:zoom-out-95 sm:data-open:slide-in-from-bottom-0 sm:data-closed:slide-out-to-bottom-0"
            : "top-1/2 left-1/2 max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl duration-100 sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className,
        )}
        {...props}
      >
        {mobileSheet && (
          <>
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 flex h-8 touch-none cursor-grab justify-center pt-3 active:cursor-grabbing sm:hidden"
              onPointerDown={(event) => {
                if (event.button !== 0) return;
                drag.current = { start: event.clientY, distance: 0, time: performance.now() };
                event.currentTarget.setPointerCapture(event.pointerId);
                event.currentTarget.parentElement?.setAttribute("data-sheet-dragging", "");
              }}
              onPointerMove={(event) => {
                if (!drag.current) return;
                drag.current.distance = Math.max(0, event.clientY - drag.current.start);
                event.currentTarget.parentElement?.style.setProperty(
                  "--sheet-drag",
                  `${drag.current.distance}px`,
                );
              }}
              onPointerUp={(event) => finishDrag(event)}
              onPointerCancel={(event) => finishDrag(event, true)}
              onLostPointerCapture={(event) => finishDrag(event, true)}
            >
              <span className="h-1 w-10 rounded-full bg-muted-foreground/40" />
            </div>
            <DialogPrimitive.Close
              ref={closeRef}
              tabIndex={-1}
              aria-hidden="true"
              className="hidden"
            />
          </>
        )}
        {children}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1.5 pb-1", className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean;
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>Close</DialogPrimitive.Close>
      )}
    </div>
  );
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-xl leading-tight font-medium tracking-tight text-foreground", className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
