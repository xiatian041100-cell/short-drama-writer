import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
  images: {
    unoptimized: true,
  },
  // 允许 WebSocket 连接
  webpack: (config) => {
    config.externals = [...(config.externals || []), { ws: 'ws' }];
    return config;
  },
};

export default nextConfig;
