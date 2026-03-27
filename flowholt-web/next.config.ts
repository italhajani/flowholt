import type { NextConfig } from "next";

import { buildSecurityHeaders } from "./src/lib/flowholt/security-headers";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: buildSecurityHeaders(),
      },
    ];
  },
};

export default nextConfig;
