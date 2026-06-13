"use client";

import { useState } from "react";
import { LoginCard } from "./login-card";
import { SignUpCard } from "./signup-card";

export function LoginClient() {
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
