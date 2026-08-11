import { ResetPasswordCard } from "../components/reset-password-card";

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <ResetPasswordCard token={token} />
    </div>
  );
}
