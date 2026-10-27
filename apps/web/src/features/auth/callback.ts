import type { AuthDialogState } from "./hooks/use-auth-dialog";

/** Email callbacks open a dialog without keeping the reset token in the address bar. */
export function getAuthCallback(url: URL): { state: AuthDialogState; cleanUrl: string } | null {
  if (url.searchParams.get("auth") !== "reset-password") return null;

  const state: AuthDialogState = {
    mode: "reset-password",
    token: url.searchParams.has("error") ? undefined : url.searchParams.get("token") || undefined,
  };
  const clean = new URL(url);
  for (const key of ["auth", "token", "error"]) clean.searchParams.delete(key);

  return { state, cleanUrl: `${clean.pathname}${clean.search}${clean.hash}` };
}
