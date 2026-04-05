import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "remotion",
    "@remotion/renderer",
    "@remotion/bundler",
    "@remotion/media-utils",
    "@tavily/core",
    "esbuild",
  ],
  turbopack: {},
};

export default nextConfig;
