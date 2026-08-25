import { toast } from "sonner";

type AuthResult = { error?: { code?: string; message?: string } | null };

/**
 * Runs an auth request, toasting and throwing on failure so TanStack Form
 * marks the submit as failed.
 */
export async function runAuthRequest(request: Promise<AuthResult>, fallback: string) {
  const { error } = await request.catch(() => {
    toast.error("Unable to reach the server. Try again.");
    throw new Error("Unable to reach the server");
  });
  if (!error) return;

  const message =
    error.code === "EMAIL_NOT_VERIFIED"
      ? "Verify your email with the link we sent, then sign in."
      : error.message || fallback;
  toast.error(message);
  throw new Error(message);
}
