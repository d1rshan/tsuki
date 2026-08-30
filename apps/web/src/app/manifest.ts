import type { MetadataRoute } from "next";

import { siteDescription, siteName, siteTagline } from "@/shared/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteTagline,
    short_name: siteName,
    description: siteDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [{ src: "/icon.png", sizes: "500x500", type: "image/png" }],
  };
}
