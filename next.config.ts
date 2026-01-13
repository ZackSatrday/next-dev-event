import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudnary.com'
      }
    ]
  }
};

export default nextConfig;
