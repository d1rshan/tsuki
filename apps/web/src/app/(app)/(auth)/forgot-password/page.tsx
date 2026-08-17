import type { Metadata } from "next";

import { ForgotPasswordView } from "@/features/auth/views/forgot-password-view";

export const metadata: Metadata = { title: "Reset your password" };

export default function Page() {
  return <ForgotPasswordView />;
}
