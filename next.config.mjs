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
};

export default nextConfig;
