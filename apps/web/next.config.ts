import type { NextConfig } from "next";
import { urls } from "./src/lib/urls";

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    staleTimes: {
      dynamic: 15, // Caches dynamic routes in the client router for 15 seconds
    },
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${urls.api}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s4.anilist.co",
      },
    ],
  },
};

export default nextConfig;
