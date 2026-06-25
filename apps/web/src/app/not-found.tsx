import Link from "next/link";
import { Home } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center">
      <div className="mb-6 w-full max-w-sm overflow-hidden">
        <img
          src="https://c.tenor.com/X3S0_ADGTjgAAAAC/tenor.gif"
          alt="Zoro getting lost"
          className="h-auto w-full object-cover"
        />
      </div>

      <h1 className="mb-8 text-4xl font-black tracking-tight text-foreground md:text-5xl">404</h1>

      <Button render={<Link href="/" />} variant="default" size="lg" nativeButton={false}>
        <Home />
        Back to Home
      </Button>
    </div>
  );
}
