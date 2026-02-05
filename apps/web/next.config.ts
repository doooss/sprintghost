import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@repo/types', '@repo/ui'],
};

export default nextConfig;
