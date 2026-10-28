import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

import type { NavbarUser } from "./";

type NavbarLinksProps = {
  pathname: string;
  user: NavbarUser | null;
};

export function NavbarLinks({ pathname, user }: NavbarLinksProps) {
  const links = [
    {
      href: "/",
      label: "Discover",
      isActive:
        pathname === "/" || pathname.startsWith("/anime/") || pathname.startsWith("/manga/"),
    },
    {
      href: "/social",
      label: "Social",
      isActive: pathname === "/social" || pathname.startsWith("/social/"),
    },
    ...(user?.username
      ? [
          {
            href: `/${user.username}`,
            label: "Profile",
            isActive: pathname.split("/")[1]?.toLowerCase() === user.username.toLowerCase(),
          },
        ]
      : []),
  ];

  // null keeps Tabs controlled when the route has no matching navigation item.
  const activeHref = links.find((link) => link.isActive)?.href ?? null;

  const activeLabel = links.find((link) => link.isActive)?.label ?? "Menu";

  return (
    <>
      <MobileNavigation pathname={pathname} links={links} activeLabel={activeLabel} />
      <Tabs
        value={activeHref}
        orientation="horizontal"
        variant="rounded"
        className="pointer-events-auto max-md:hidden"
      >
        <TabsList aria-label="Main navigation" className="max-md:h-10.5">
          {links.map((link) => (
            <TabsTrigger
              key={link.href}
              value={link.href}
              nativeButton={false}
              render={
                <Link
                  href={link.href}
                  prefetch={link.label === "Profile" ? true : undefined}
                  aria-current={link.isActive ? "page" : undefined}
                />
              }
            >
              {link.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </>
  );
}

type NavigationLink = { href: string; label: string; isActive: boolean };

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function MobileNavigation({
  pathname,
  links,
  activeLabel,
}: {
  pathname: string;
  links: NavigationLink[];
  activeLabel: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<"first" | "last" | null>(null);
  const optionsId = useId();
  const reduceMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    prefersReducedMotion,
    () => true,
  );
  const options = links.filter((link) => !link.isActive);
  const transition = { duration: reduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] as const };

  useEffect(() => {
    setExpanded(false);
  }, [pathname]);

  useEffect(() => {
    if (!expanded) return;
    const options = surfaceRef.current?.querySelectorAll<HTMLAnchorElement>("a");
    if (pendingFocus.current && options?.length) {
      options[pendingFocus.current === "first" ? 0 : options.length - 1]?.focus();
      pendingFocus.current = null;
    }
    function dismiss(event: PointerEvent) {
      if (!surfaceRef.current?.contains(event.target as Node)) setExpanded(false);
    }
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [expanded]);

  function close() {
    setExpanded(false);
    triggerRef.current?.focus();
  }

  return (
    <div className="pointer-events-auto relative h-10.5 w-24 md:hidden">
      <motion.div
        ref={surfaceRef}
        className="rounded-[21px] bg-muted p-1"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setExpanded(false);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape" && expanded) {
            event.preventDefault();
            event.stopPropagation();
            close();
            return;
          }
          if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          if (!expanded) {
            pendingFocus.current =
              event.key === "ArrowUp" || event.key === "End" ? "last" : "first";
            setExpanded(true);
            return;
          }
          const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button, a"));
          const index = items.indexOf(document.activeElement as HTMLElement);
          const next =
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? items.length - 1
                : (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
          items[next]?.focus();
        }}
      >
        <button
          ref={triggerRef}
          type="button"
          aria-label={"Main navigation: " + activeLabel}
          aria-expanded={expanded}
          aria-controls={optionsId}
          aria-current={links.some((link) => link.isActive) ? "page" : undefined}
          className="flex h-8.5 w-full items-center justify-center gap-1 rounded-full border-[0.2px] border-border bg-card px-2 text-[13px] font-medium text-card-foreground shadow-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          onClick={() => setExpanded((open) => !open)}
        >
          <motion.span
            key={activeLabel}
            initial={{ opacity: reduceMotion ? 1 : 0 }}
            animate={{ opacity: 1 }}
            transition={transition}
          >
            {activeLabel}
          </motion.span>
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={transition}>
            <ChevronDown aria-hidden="true" className="size-3" />
          </motion.span>
        </button>
        <motion.div
          id={optionsId}
          inert={!expanded}
          aria-hidden={!expanded}
          initial={false}
          animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
          transition={transition}
          className="overflow-hidden"
        >
          <ul className="flex flex-col gap-1 pt-1">
            {options.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  prefetch={link.label === "Profile" ? true : undefined}
                  onNavigate={close}
                  className="flex h-8.5 items-center justify-center rounded-full px-2 text-[13px] font-medium text-muted-foreground outline-none transition-colors hover:bg-card/70 hover:text-card-foreground focus-visible:bg-card focus-visible:text-card-foreground focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50 motion-reduce:transition-none"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}
