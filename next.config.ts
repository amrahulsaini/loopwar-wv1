import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix workspace root detection warning
  outputFileTracingRoot: process.cwd(),
  // Use the new serverExternalPackages instead of experimental
  serverExternalPackages: ['mysql2']
};

export default nextConfig;
