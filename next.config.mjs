import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep googleapis out of the webpack bundle — it relies on Node.js internals
  // that the bundler cannot resolve at build time.
  serverExternalPackages: ["googleapis"],
  // Fix: Next.js misdetects workspace root when a package-lock.json exists in
  // a parent directory (e.g. C:\Users\cuong\). Pinning this explicitly silences
  // the warning and prevents compilation failures.
  outputFileTracingRoot: __dirname,
  experimental: {
    // Next.js 15 changed the default client router cache for dynamic routes
    // from 30s → 0s, causing pages to re-fetch (and visually "reload") every
    // time you navigate back to them or switch browser tabs back to the app.
    // Restore sensible cache durations to prevent this behaviour.
    staleTimes: {
      dynamic: 30,   // cache server-component data for 30s (was Next.js 14 default)
      static: 300,   // cache static pages for 5 min
    },
  },
  async headers() {
    return [
      {
        source: "/vocabulary-challenge/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.tailwindcss.com https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://unpkg.com; img-src 'self' data: blob:; worker-src blob:;"
          }
        ]
      }
    ]
  }
};

export default nextConfig;
