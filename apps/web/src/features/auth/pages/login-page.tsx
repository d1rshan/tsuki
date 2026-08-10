import { LoginCard } from "../components/login-card";
import { SignUpCard } from "../components/signup-card";

export async function LoginPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      {mode === "signup" ? <SignUpCard /> : <LoginCard />}
    </div>
  );
}
