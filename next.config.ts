import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.d\.ts$/,
      loader: 'ignore-loader',
    });
    return config;
  },
};

export default nextConfig;