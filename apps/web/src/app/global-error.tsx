"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
          <h1 className="text-2xl font-bold">Tsuki could not start</h1>
          <p>Please try loading the app again.</p>
          <button type="button" onClick={unstable_retry} className="rounded-md border px-3 py-2">
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
