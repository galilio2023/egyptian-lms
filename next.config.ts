import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(self), geolocation=(), browsing-topics=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      isDev
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
        : "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data: https://images.unsplash.com https://img.youtube.com https://*.bunnycdn.com https://*.b-cdn.net",
      "font-src 'self' data:",
      "connect-src 'self' https://*.b-cdn.net https://*.bunnycdn.com https://video.bunnycdn.com https://accept.paymob.com https://generativelanguage.googleapis.com https://*.upstash.io https://test-streams.mux.dev https://api.wasapi.io",
      "media-src 'self' blob: data: https://*.b-cdn.net https://*.bunnycdn.com https://test-streams.mux.dev",
      "frame-src 'self' https://accept.paymob.com https://www.youtube.com https://www.youtube-nocookie.com https://iframe.mediadelivery.net",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://accept.paymob.com",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "*.bunnycdn.com",
      },
      {
        protocol: "https",
        hostname: "*.b-cdn.net",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
