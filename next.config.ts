import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.5.219", "192.168.5.180", "localhost", "127.0.0.1"],
  turbopack: {},
};

export default nextConfig;
