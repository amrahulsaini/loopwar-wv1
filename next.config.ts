import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix workspace root detection warning
  outputFileTracingRoot: '/home/loopwar.dev/public_html/loopwar-wv1',
  experimental: {
    // Optimize server-side builds
    serverComponentsExternalPackages: ['mysql2']
  }
};

export default nextConfig;
