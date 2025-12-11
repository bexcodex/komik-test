import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'komiku.id',
      },
      {
        protocol: 'https',
        hostname: '*.komiku.id',
      },
      {
        protocol: 'https',
        hostname: 'komiku.org',
      },
      {
        protocol: 'https',
        hostname: '*.komiku.org',
      }
    ],
    // Allow local API routes to serve images
    localPatterns: [
      {
        pathname: '/api/image',
        search: '', // allow all search parameters
      }
    ],
    dangerouslyAllowSVG: true, 
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
