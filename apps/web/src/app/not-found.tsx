import Link from "next/link";
import { Home } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-4 text-center">
      <p className="text-sm font-semibold uppercase text-muted-foreground">404</p>
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mb-4 max-w-sm text-sm text-muted-foreground">
        The page may have moved, or the address may be incorrect.
      </p>
      <Button render={<Link href="/" />} size="lg" nativeButton={false}>
        <Home />
        Back to home
      </Button>
    </div>
  );
}
