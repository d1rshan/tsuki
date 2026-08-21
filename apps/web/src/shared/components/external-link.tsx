import { ExternalLink as ExternalLinkIcon } from "lucide-react";

export function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <span className="group-hover:underline group-hover:decoration-dashed group-hover:underline-offset-4">
        {children}
      </span>
      <ExternalLinkIcon
        aria-hidden="true"
        className="size-3 opacity-0 transition-opacity group-hover:opacity-100"
      />
    </a>
  );
}
