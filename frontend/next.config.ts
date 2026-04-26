import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

if (process.env.NEXT_STANDALONE === "true") {
  nextConfig.output = "standalone";
}

export default nextConfig;
