import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Turbopack for build to avoid Windows symlink issues
  experimental: {
    turbo: undefined,
  },
};

export default nextConfig;
