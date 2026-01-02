import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration for production builds
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
