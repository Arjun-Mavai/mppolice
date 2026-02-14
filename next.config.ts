import type { NextConfig } from 'next';

const hostnames = [
  'riversinsight.com',
  'media.assettype.com',
  'thumbs.dreamstime.com',
  'eos.com',
  'static.wixstatic.com',
  'pwonlyias.com',
  'notes.saralupsc.com',
  'framerusercontent.com',
  'chrysalishigh.com',
  'i.pravatar.cc',
  // 'example.com',
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...hostnames.map((hostname) => ({
        protocol: 'https' as const,
        hostname,
      })),
      {
        protocol: 'https' as const,
        hostname: '**', // Allow all HTTPS images (Optional)
      },
    ],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        ],
      },
      // Auth-related pages must never be browser-cached
      {
        source: '/login',
        headers: [{ key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' }],
      },
      {
        source: '/signup',
        headers: [{ key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' }],
      },
      {
        source: '/dashboard',
        headers: [{ key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' }],
      },
      {
        source: '/api/auth/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' }],
      },
    ];
  },
};

export default nextConfig;
