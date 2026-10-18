import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
