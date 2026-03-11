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
};

export default nextConfig;
