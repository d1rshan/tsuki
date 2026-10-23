"use client";

import { LayoutGroup } from "framer-motion";

export function MediaLayoutGroup({ children }: { children: React.ReactNode }) {
  return <LayoutGroup id="media-detail">{children}</LayoutGroup>;
}
