import { ExternalLink as ExternalLinkIcon } from "lucide-react";

export function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:underline hover:underline-offset-4"
    >
      {children}
      <ExternalLinkIcon aria-hidden="true" className="size-3" />
    </a>
  );
}
