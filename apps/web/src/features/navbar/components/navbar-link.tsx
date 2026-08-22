import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

type NavbarLinkProps = {
  href: string;
  isActive: boolean;
  isMobile: boolean;
  children: ReactNode;
  onNavigate?: () => void;
  prefetch?: boolean;
};

export function NavbarLink({
  href,
  isActive,
  isMobile,
  onNavigate,
  prefetch,
  children,
}: NavbarLinkProps) {
  const linkClassName = cn(
    "text-xs font-black uppercase tracking-widest transition-all duration-300",
    isMobile
      ? "flex w-full items-center rounded-lg px-3 py-3"
      : "group/link inline-flex items-center py-2 hover:text-foreground",
    isActive ? "text-foreground" : "text-muted-foreground",
    isMobile && (isActive ? "bg-foreground/5" : "hover:bg-foreground/5 hover:text-foreground"),
  );
  const content = isMobile ? (
    children
  ) : (
    <span className="relative">
      {children}
      <span
        className={cn(
          "absolute -bottom-1 left-0 h-px bg-foreground transition-all duration-300",
          isActive ? "w-full" : "w-0 group-hover/link:w-full",
        )}
      />
    </span>
  );

  return (
    <Link href={href} prefetch={prefetch} onNavigate={onNavigate} className={linkClassName}>
      {content}
    </Link>
  );
}
