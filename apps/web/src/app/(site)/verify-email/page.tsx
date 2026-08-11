import type { Metadata } from "next";

export const metadata: Metadata = { title: "Verify your email" };

export const instant = false;

export { VerifyEmailPage as default } from "@/features/auth/pages/verify-email-page";
