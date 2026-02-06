import type { NextConfig } from "next";

const hostnames = [
  'riversinsight.com',
  'media.assettype.com',
  'thumbs.dreamstime.com',
  'eos.com',
  'static.wixstatic.com',
  'pwonlyias.com',
  'notes.saralupsc.com',
  'framerusercontent.com',
  'chrysalishigh.com'
  // 'example.com',
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...hostnames.map(hostname => ({
        protocol: 'https' as const,
        hostname,
      })),
      {
        protocol: 'https' as const,
        hostname: '**', // Allow all HTTPS images (Optional)
      }
    ],
  },
  cacheComponents: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
