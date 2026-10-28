"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Dialog, DialogContent } from "@/shared/components/ui/dialog";

import { getAuthCallback } from "../callback";
import { AuthDialogContext, type AuthDialogState } from "../hooks/use-auth-dialog";
import { ForgotPasswordView } from "../views/forgot-password-view";
import { LoginView } from "../views/login-view";
import { ResetPasswordView } from "../views/reset-password-view";
import { VerifyEmailView } from "../views/verify-email-view";

export function AuthDialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthDialogState>({ mode: "sign-in" });
  const [isOpen, setIsOpen] = useState(false);
  const returnFocus = useRef<HTMLElement | null>(null);

  const openAuth = useCallback((next: AuthDialogState = { mode: "sign-in" }) => {
    // Switching forms keeps the original trigger as the return-focus target.
    if (!document.activeElement?.closest("[data-auth-dialog]")) {
      returnFocus.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
    setState(next);
    setIsOpen(true);
  }, []);

  const closeAuth = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const callback = getAuthCallback(new URL(window.location.href));
    if (!callback) return;

    openAuth(callback.state);
    window.history.replaceState(window.history.state, "", callback.cleanUrl);
  }, [openAuth]);

  return (
    <AuthDialogContext value={{ openAuth, closeAuth }}>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          data-auth-dialog
          className={
            state.mode === "verify-email"
              ? undefined
              : "sm:max-h-[80vh] sm:max-w-80 sm:overflow-y-auto"
          }
          finalFocus={returnFocus}
        >
          <AuthDialogView
            key={state.mode === "sign-in" || state.mode === "sign-up" ? "credentials" : state.mode}
            state={state}
          />
        </DialogContent>
      </Dialog>
    </AuthDialogContext>
  );
}

function AuthDialogView({ state }: { state: AuthDialogState }) {
  switch (state.mode) {
    case "sign-in":
    case "sign-up":
      return <LoginView mode={state.mode} />;
    case "forgot-password":
      return <ForgotPasswordView />;
    case "reset-password":
      return <ResetPasswordView token={state.token} />;
    case "verify-email":
      return <VerifyEmailView email={state.email} />;
  }
}
