import type { NextConfig } from "next";

/**
 * Detect the dev server via Next's own phase constant — deterministic
 * regardless of how NODE_ENV is set by the script runner (e.g. Bun
 * injects NODE_ENV=development into build scripts).
 */
const isDev = process.env.NEXT_PHASE === "phase-development-server";

/**
 * Content-Security-Policy — covers everything the site legitimately
 * needs (self-hosted fonts/media, admin uploads to Vercel Blob,
 * external poster/video URLs an admin may paste) and blocks the rest.
 * 'unsafe-eval' is only required by the Next.js dev server (HMR).
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.blob.vercel-storage.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  /* Self-hosted sandbox convenience; Vercel ignores this and uses its own output. */
  output: "standalone",
  /* Strict in CI and local so type errors never ship to production. */
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
