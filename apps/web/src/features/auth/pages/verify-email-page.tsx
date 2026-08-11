import { VerifyEmailCard } from "../components/verify-email-card";

export async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <VerifyEmailCard email={email} />
    </div>
  );
}
