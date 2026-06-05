import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/ad-simulator',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
