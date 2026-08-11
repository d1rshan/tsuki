import type { Metadata } from "next";

export const metadata: Metadata = { title: "Choose a new password" };

export const instant = false;

export { ResetPasswordPage as default } from "@/features/auth/pages/reset-password-page";
