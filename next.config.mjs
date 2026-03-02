/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep googleapis out of the webpack bundle — it relies on Node.js internals
  // that the bundler cannot resolve at build time.
  serverExternalPackages: ["googleapis"],
};

export default nextConfig;
