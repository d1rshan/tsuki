"use client";

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";

/**
 * Warns before an unsaved Rich Content document is lost to a page unload.
 * ponytail: covers tab close/refresh; in-app route guards need per-Link
 * interception — add only if authors actually lose work that way.
 */
export function useUnloadWarning(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;

    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      // Legacy Chrome/Edge require returnValue before they'll prompt.
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);
}

/**
 * Owns the close-with-unsaved-changes flow shared by dialogs containing an
 * editor: confirm-discard on dirty close, plus a reset key that remounts the
 * uncontrolled editor whenever the form resets (open, discard, close).
 */
export function useDiscardableDialog(isDirty: boolean, onReset: () => void) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmingClose, setIsConfirmingClose] = useState(false);
  const [editorResetKey, setEditorResetKey] = useState(0);

  function reset() {
    onReset();
    setEditorResetKey((key) => key + 1);
  }

  /** Force-close, ignoring dirtiness (post-save, unmount cleanup). */
  function close() {
    setIsOpen(false);
    reset();
  }

  function open() {
    setIsOpen(true);
    reset();
  }

  /** Close honouring unsaved changes; may open the confirm dialog instead. */
  function requestClose() {
    if (isDirty) {
      setIsConfirmingClose(true);
      return;
    }
    close();
  }

  function handleOpenChange(nextIsOpen: boolean) {
    if (!nextIsOpen && isDirty) {
      setIsConfirmingClose(true);
      return;
    }
    if (nextIsOpen) {
      open();
    } else {
      close();
    }
  }

  return {
    isOpen,
    setIsOpen,
    editorResetKey,
    isConfirmingClose,
    open,
    close,
    requestClose,
    handleOpenChange,
    discard: () => {
      setIsConfirmingClose(false);
      close();
    },
    keepEditing: () => setIsConfirmingClose(false),
  };
}

/** Shown when closing a dialog that has changed, unsaved editor content. */
export function DiscardChangesDialog({
  open,
  onDiscard,
  onKeepEditing,
}: {
  open: boolean;
  onDiscard: () => void;
  onKeepEditing: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onKeepEditing()}>
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle>Discard changes?</DialogTitle>
          <DialogDescription>
            You have unsaved changes that will be lost if you close now.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onKeepEditing}>
            Keep editing
          </Button>
          <Button type="button" variant="destructive" onClick={onDiscard}>
            Discard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
