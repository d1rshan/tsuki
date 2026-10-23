import { LoginModal } from "@/features/auth/components/login-modal";
import { LoginView } from "@/features/auth/views/login-view";

export const instant = false;

export default async function Page({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;

  return (
    <LoginModal mode={mode}>
      <LoginView mode={mode} />
    </LoginModal>
  );
}
