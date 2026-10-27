import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(process.env.BUILD_STANDALONE === 'true' ? { output: 'standalone' } : {})
};

export default nextConfig;
