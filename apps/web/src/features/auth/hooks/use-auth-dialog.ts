"use client";

import { createContext, useContext } from "react";

export type AuthDialogState =
  | { mode: "sign-in" | "sign-up" | "forgot-password" }
  | { mode: "reset-password"; token?: string }
  | { mode: "verify-email"; email?: string };

export const AuthDialogContext = createContext<{
  openAuth: (state?: AuthDialogState) => void;
  closeAuth: () => void;
} | null>(null);

export function useAuthDialog() {
  const context = useContext(AuthDialogContext);
  if (!context) throw new Error("useAuthDialog must be used within AuthDialogProvider");
  return context;
}
