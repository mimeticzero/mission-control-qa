import type { NextConfig } from 'next'

// Content Security Policy
// 'unsafe-inline' required by Next.js style injection + Leaflet
// 'unsafe-eval' required by Next.js hot reload (dev) and some recharts internals
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*.cartocdn.com https://*.openstreetmap.org https://*.tile.openstreetmap.org",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const SECURITY_HEADERS = [
  { key: 'X-Frame-Options',          value: 'DENY' },
  { key: 'X-Content-Type-Options',   value: 'nosniff' },
  { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',       value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy',  value: CSP },
  { key: 'X-DNS-Prefetch-Control',   value: 'on' },
]

const nextConfig: NextConfig = {
  // react-leaflet v4 does not survive React Strict Mode's intentional double-mount:
  // Leaflet stores ._leaflet_id on the DOM node; the second mount throws
  // "Map container is already initialized." Strict Mode is a dev-only behaviour
  // (automatically disabled in production builds), so this has zero production impact.
  reactStrictMode: false,

  // Path-based deployment: served under sakuranode.com/mission-control via rewrites
  basePath: '/mission-control',

  // Don't expose Next.js version in X-Powered-By header
  poweredByHeader: false,

  webpack: (config) => {
    config.resolve.alias = { ...config.resolve.alias }
    return config
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: SECURITY_HEADERS,
    },
  ],
}

export default nextConfig
