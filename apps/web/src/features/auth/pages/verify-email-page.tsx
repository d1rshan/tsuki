import { VerifyEmailCard } from "../components/verify-email-card";

type VerifyEmailPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { email } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <VerifyEmailCard email={email} />
    </div>
  );
}
