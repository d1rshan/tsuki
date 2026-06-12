"use client";

import { useState } from "react";
import { LoginCard } from "@/components/auth/login-card";
import { SignUpCard } from "@/components/auth/signup-card";

export default function LoginPage() {
  const [view, setView] = useState<"login" | "signup">("login");

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      {view === "login" ? (
        <LoginCard onSwitchToSignUp={() => setView("signup")} />
      ) : (
        <SignUpCard onSwitchToLogin={() => setView("login")} />
      )}
    </div>
  );
}
