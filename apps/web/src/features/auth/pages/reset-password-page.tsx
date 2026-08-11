import { ResetPasswordCard } from "../components/reset-password-card";

export async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <ResetPasswordCard token={token} />
    </div>
  );
}
