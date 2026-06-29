import type { NextConfig } from "next";

import { env } from "@tsuki/env";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // experimental: {
  //   staleTimes: {
  //     dynamic: 15, // Caches dynamic routes in the client router for 15 seconds
  //   },
  // },
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${env.NEXT_PUBLIC_API_URL}/api/auth/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${env.NEXT_PUBLIC_API_URL}/:path*`,
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
